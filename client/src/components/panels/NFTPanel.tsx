import React from 'react';
import { NFTData } from '@/types/chimereTypes';

interface NFTPanelProps {
  nftData?: NFTData;
}

export function NFTPanel({ nftData }: NFTPanelProps) {
  if (!nftData) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-full">
        <div className="p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Pas de données NFT</h3>
          <p className="text-sm text-gray-500">
            Cette Chimère n'est pas liée à un token NFT.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 mb-4 border border-purple-100">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-md font-medium text-indigo-900">NFT Information</h4>
            <p className="text-xs text-indigo-600">Blockchain Record</p>
          </div>
          <div className="p-2 bg-white rounded-full shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Token ID</p>
            <p className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-200 overflow-x-auto">
              {nftData.tokenId}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Contract Address</p>
            <p className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-200 overflow-x-auto">
              {nftData.contractAddress}
            </p>
          </div>
          
          <div className="flex justify-between">
            <div className="w-1/2 pr-2">
              <p className="text-xs text-gray-500 mb-1">Owner</p>
              <p className="text-sm font-mono bg-white px-2 py-1 rounded border border-gray-200 overflow-hidden text-ellipsis">
                {nftData.owner.substring(0, 6)}...{nftData.owner.substring(nftData.owner.length - 4)}
              </p>
            </div>
            <div className="w-1/2 pl-2">
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm bg-white px-2 py-1 rounded border border-gray-200">
                {nftData.creationDate}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {nftData.metadata && (
        <div className="mt-4">
          <h5 className="text-md font-medium mb-2">Metadata</h5>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <pre className="text-xs overflow-auto max-h-40 font-mono text-gray-700">
              {JSON.stringify(nftData.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between">
        <a 
          href={`https://etherscan.io/token/${nftData.contractAddress}?a=${nftData.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <span>View on Etherscan</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        
        <a 
          href={`https://opensea.io/assets/${nftData.contractAddress}/${nftData.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <span>View on OpenSea</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}