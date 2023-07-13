import { Forwarder, IERC20 } from '../../typechain-types';
import { PromiseOrValue } from '../../typechain-types/common';
import type {
  BigNumberish,
  BytesLike,
  ContractTransaction,
  Overrides,
  BigNumber,
  CallOverrides
} from 'ethers';

export interface IERC20PermitWithAddress extends IERC20 {
  address: string;
  name: () => Promise<string>;
  permit(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    value: PromiseOrValue<BigNumberish>,
    deadline: PromiseOrValue<BigNumberish>,
    v: PromiseOrValue<BigNumberish>,
    r: PromiseOrValue<BytesLike>,
    s: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;
  nonces(owner: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
}

export interface ForwarderWithAddress extends Forwarder {
  address: string;
}

export interface ContractConfig {
  contractName: 'Forwarder';
  tokenNames: string[];
  domainName: string;
  tokensMinted: string;
  gasLimit: number;
}
