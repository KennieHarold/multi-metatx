import chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Signature } from 'ethers';
import { ContractConfig, ForwarderWithAddress, IERC20PermitWithAddress } from './typings/forwarder';
import * as erc20Eip712 from '../utils/eip712/erc20Permit';
import * as metaTxEip712 from '../utils/eip712/metaTx';

chai.use(ChaiAsPromised);

const { parseEther } = ethers.utils;

function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

const ContractConfig: ContractConfig = {
  contractName: 'Forwarder',
  tokenNames: ['Token1', 'Token2', 'Token3'],
  domainName: 'MultiMetaTx',
  tokensMinted: '1000000',
  gasLimit: 100000
};

describe('Forwarder test suite', function () {
  let [owner, sender1, sender2, sender3, receiver1, receiver2, receiver3]: SignerWithAddress[] = [];
  let forwarder: ForwarderWithAddress;
  let tokens: IERC20PermitWithAddress[] = [];
  let airdropAmount = '10';

  before(async function () {
    [owner, sender1, sender2, sender3, receiver1, receiver2, receiver3] = await ethers.getSigners();
  });

  describe('#Deployment', async function () {
    describe('Deploy forwarder', async function () {
      it('should deploy receiver contract', async function () {
        const Contract = await ethers.getContractFactory(ContractConfig.contractName);
        forwarder = (await Contract.deploy()) as ForwarderWithAddress;
        await forwarder.deployed();
      });
    });

    describe('Deploy tokens', async function () {
      it('should deploy erc20 contracts', async function () {
        for (let tokenName of ContractConfig.tokenNames) {
          const Token = await ethers.getContractFactory(tokenName);
          const token = (await Token.deploy()) as IERC20PermitWithAddress;
          await token.deployed();
          tokens.push(token);
        }
      });

      it('should airdrop tokens', async function () {
        for (const token of tokens) {
          await token.transfer(sender1.address, parseEther(airdropAmount).toString());
          await token.transfer(sender2.address, parseEther(airdropAmount).toString());
          await token.transfer(sender3.address, parseEther(airdropAmount).toString());

          expect(await token.balanceOf(sender1.address)).to.eq(parseEther(airdropAmount));
          expect(await token.balanceOf(sender2.address)).to.eq(parseEther(airdropAmount));
          expect(await token.balanceOf(sender3.address)).to.eq(parseEther(airdropAmount));
        }
      });

      it('should whitelist tokens', async function () {
        for (let token of tokens) {
          await forwarder.whitelistToken(token.address);
        }
      });
    });
  });

  describe('#Meta Transaction', async function () {
    let { baseDomain, types } = erc20Eip712;
    let value = ethers.utils.parseEther('1');
    let deadline = getTimestampInSeconds() + 4200;

    /**
     * @dev Two dimensional signature array for each sender on each token
     * Signature[`token`][`sender`]
     */
    let signatures: Signature[][] = [];

    describe('EIP-2612', async function () {
      it("should sign EIP-712 and match signature to signer's address", async function () {
        let senders = [sender1, sender2, sender3];

        for (let i = 0; i < tokens.length; i++) {
          const senderSignatures: Signature[] = [];

          for (let j = 0; j < senders.length; j++) {
            const token = tokens[i];
            const sender = senders[j];

            const name = await token.name();
            const nonce = await token.nonces(sender.address);

            const values = {
              owner: sender.address,
              spender: forwarder.address,
              value,
              nonce,
              deadline
            };

            const domain = {
              ...baseDomain,
              name,
              verifyingContract: token.address
            };

            const signature = await sender._signTypedData(domain, types, values);
            const sig = ethers.utils.splitSignature(signature);
            senderSignatures.push(sig);

            expect(ethers.utils.verifyTypedData(domain, types, values, sig)).to.eq(sender.address);
          }
          signatures.push(senderSignatures);
        }
      });

      it('should gasless approve', async function () {
        let senders = [sender1, sender2, sender3];

        for (let i = 0; i < tokens.length; i++) {
          for (let j = 0; j < senders.length; j++) {
            const token = tokens[i];
            const sender = senders[j];

            await token
              .connect(owner)
              .permit(
                sender.address,
                forwarder.address,
                value,
                deadline,
                signatures[i][j].v,
                signatures[i][j].r,
                signatures[i][j].s
              );

            expect(await token.allowance(sender.address, forwarder.address)).to.be.eq(value);
          }
        }
      });
    });

    describe('Batch transfer', async function () {
      let { baseDomain, types } = metaTxEip712;
      let amount = ethers.utils.parseEther('1');

      it('should batch transfer without any errors', async function () {
        let senders = [sender1, sender2, sender3];
        let receivers = [receiver1, receiver2, receiver3];
        let metaTxWithSignatures = [];
        let nonceIterator = 0;

        for (let i = 0; i < tokens.length; i++) {
          for (let j = 0; j < senders.length; j++) {
            const token = tokens[i];
            const sender = senders[j];
            const receiver = receivers[j];
            const nonce = Number(await forwarder.getNonce(sender.address)) + nonceIterator;

            const domain = {
              ...baseDomain,
              verifyingContract: forwarder.address
            };

            const values = {
              from: sender.address,
              to: receiver.address,
              token: token.address,
              amount,
              nonce
            };

            const signature = await sender._signTypedData(domain, types, values);
            metaTxWithSignatures.push({
              metaTx: values,
              signature
            });
          }

          nonceIterator++;
        }

        await forwarder.batchTransfer(metaTxWithSignatures, ContractConfig.gasLimit);

        for (let i = 0; i < tokens.length; i++) {
          for (let j = 0; j < senders.length; j++) {
            const token = tokens[i];
            const receiver = receivers[j];
            expect(await token.balanceOf(receiver.address)).to.be.eq(amount);
          }
        }
      });
    });
  });
});
