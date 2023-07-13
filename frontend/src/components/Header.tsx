import { JsonRpcSigner } from 'ethers';
import { memo } from 'react';

interface HeaderProps {
  signer: JsonRpcSigner | null;
  connect: () => void;
}

function Header({ signer, connect }: HeaderProps) {
  return (
    <div className="flex flex-row px-10 pt-5 justify-between">
      <div className="flex flex-row items-center">
        <a
          className="text-gray-500 mr-6 text-sm"
          href="https://kennieharold.me"
          target="_blank"
          referrerPolicy="no-referrer"
        >
          About Me
        </a>
        <a className="text-gray-500 text-sm" href="https://github.com/KennieHarold/multi-metatx">
          Github Repo
        </a>
      </div>
      <div className="flex flex-row items-center h-10">
        <div className="flex bg-gray-700/75 px-5 h-full rounded-lg mr-4">
          <select
            name="networks"
            className="bg-transparent text-zinc-100 align-center outline-none focus:outline-none border-none focus:border-none focus:ring-0"
          >
            <option value="sepolia">Sepolia</option>
            <option value="goerli">Goerli</option>
          </select>
        </div>
        {signer ? (
          <button className="bg-transparent rounded-full px-6 text-sm border border-white/25 h-full">
            {`0x...${signer.address.slice(-5)}`}
          </button>
        ) : (
          <button className="bg-blue-600 rounded-full px-6 text-sm h-full" onClick={connect}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(Header);
