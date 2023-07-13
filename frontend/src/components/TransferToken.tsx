import { TokenContractWithInfo } from '@/typings/default';
import React from 'react';

interface TransferTokenProps {
  setAmount: (amount: number | null) => void;
  selectedToken: TokenContractWithInfo | null | undefined;
  onSelectTokenChange: (event: any) => void;
  tokens: TokenContractWithInfo[];
  amount: number | null;
  receiver: `0x${string}` | null;
  setReceiver: (receiver: `0x${string}`) => void;
  isSatisfiesRequirements: () => boolean;
  onTransfer: () => void;
}

function TransferToken({
  setAmount,
  selectedToken,
  onSelectTokenChange,
  tokens,
  amount,
  receiver,
  setReceiver,
  isSatisfiesRequirements,
  onTransfer
}: TransferTokenProps) {
  return (
    <div className="flex flex-wrap p-10 items-center justify-center">
      <div className="lg:w-2/5 md:w-3/4 sm:w-full xs:w-full">
        <div className="bg-gray-700/25 rounded-md p-6">
          <div className="mb-4">Gasless Transfer</div>
          <div className="bg-gray-700/50 rounded-md p-4 mb-6">
            <div className="flex flex-row justify-between mb-4">
              <span>From:</span>
              <div className="flex flex-row">
                <button
                  className="mr-10 text-blue-500"
                  onClick={() => setAmount((selectedToken?.info?.balance ?? 0) / 2)}
                >
                  50%
                </button>
                <button
                  className="text-blue-500"
                  onClick={() => setAmount(selectedToken?.info?.balance ?? 0)}
                >
                  Max
                </button>
              </div>
            </div>

            <div className="flex flex-row h-12 gap-2 mb-4">
              <div className="flex bg-gray-700/75 px-7 h-full rounded-full">
                <select
                  value={selectedToken?.info.address}
                  name="tokens"
                  className="bg-transparent text-zinc-100 align-center outline-none focus:outline-none border-none focus:border-none focus:ring-0"
                  onChange={onSelectTokenChange}
                >
                  <option disabled selected>
                    Select
                  </option>
                  {tokens.map((token) => (
                    <option key={`token-${token.info.address}`} value={token.info.address}>
                      {token.info.symbol}
                    </option>
                  ))}
                </select>
              </div>

              <input
                value={amount ?? ''}
                className="flex-1 bg-transparent outline-none focus:outline-none border-none focus:border-none focus:ring-0 text-lg text-zinc-400 text-right"
                type="number"
                onChange={(e) => {
                  const parsed = !isNaN(e.target.valueAsNumber) ? e.target.valueAsNumber : null;
                  setAmount(parsed);
                }}
                placeholder="0.00"
              />
            </div>

            <span className="text-sm">
              Balance: {(selectedToken?.info.balance ?? 0).toFixed(4)}
            </span>
          </div>

          <div className="bg-gray-700/50 rounded-md p-4 mb-8">
            <div className="flex flex-row justify-between mb-4">
              <span>To:</span>
            </div>

            <div className="flex flex-row h-12 gap-2">
              <input
                value={receiver ?? ''}
                className="flex-1 bg-transparent outline-none focus:outline-none border-none focus:border-none focus:ring-0 text-lg text-zinc-400"
                type="text"
                placeholder="0x...123"
                onChange={(e) => setReceiver(e.target.value as `0x${string}`)}
              />
            </div>
          </div>

          <button
            className={`w-full ${
              isSatisfiesRequirements() ? 'bg-blue-800' : 'bg-gray-800'
            } rounded-md h-14`}
            onClick={onTransfer}
            disabled={!isSatisfiesRequirements()}
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferToken;
