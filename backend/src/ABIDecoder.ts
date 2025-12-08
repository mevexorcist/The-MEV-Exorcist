import { ethers } from 'ethers';

export interface DecodedTransaction {
  hash: string;
  from: string;
  to: string;
  value: bigint;
  functionName: string;
  parameters: {
    amountIn?: bigint;
    amountOutMin?: bigint;
    path?: string[];
    recipient?: string;
    deadline?: number;
    [key: string]: any; // Allow other parameters
  };
}

/**
 * ABI Decoder for Uniswap V3 Router transactions
 * Decodes transaction input data and identifies swap operations
 */
export class ABIDecoder {
  private interface: ethers.Interface;
  
  // Uniswap V3 Router ABI - includes common swap functions
  private static readonly UNISWAP_V3_ABI = [
    // exactInputSingle - swap exact amount of one token for another
    'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
    
    // exactInput - swap exact amount through multiple pools
    'function exactInput((bytes path, address recipient, uint256 deadline, uint256 amountIn, uint256 amountOutMinimum)) external payable returns (uint256 amountOut)',
    
    // exactOutputSingle - receive exact amount of one token for another
    'function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)',
    
    // exactOutput - receive exact amount through multiple pools
    'function exactOutput((bytes path, address recipient, uint256 deadline, uint256 amountOut, uint256 amountInMaximum)) external payable returns (uint256 amountIn)',
    
    // multicall - batch multiple operations
    'function multicall(uint256 deadline, bytes[] data) external payable returns (bytes[] results)',
    
    // unwrapWETH9 - unwrap WETH to ETH
    'function unwrapWETH9(uint256 amountMinimum, address recipient) external payable',
    
    // refundETH - refund leftover ETH
    'function refundETH() external payable',
  ];

  constructor(abi?: any[]) {
    // Use provided ABI or default Uniswap V3 ABI
    this.interface = new ethers.Interface(abi || ABIDecoder.UNISWAP_V3_ABI);
  }

  /**
   * Decodes transaction input data using the Uniswap V3 ABI
   * Returns null if decoding fails
   */
  decode(inputData: string, txHash: string, from: string, to: string, value: string): DecodedTransaction | null {
    try {
      // Parse the transaction data
      const parsed = this.interface.parseTransaction({ data: inputData });
      
      if (!parsed) {
        console.error(`Failed to parse transaction data: ${txHash}`);
        return null;
      }

      // Extract parameters into a plain object
      const parameters: DecodedTransaction['parameters'] = {};
      
      // Handle different function signatures
      if (parsed.args && parsed.args.length > 0) {
        // For functions with struct parameters (like exactInputSingle)
        const firstArg = parsed.args[0];
        
        // ethers.js Result objects are array-like but also have named properties
        // Check if it's a tuple/struct by checking the fragment
        const firstInput = parsed.fragment.inputs[0];
        const isStruct = firstInput && firstInput.baseType === 'tuple';
        
        if (isStruct && firstArg) {
          // Access properties by index and name from the Result object
          // ethers Result objects support both array indexing and named property access
          const params = firstArg as any;
          
          // Helper to safely extract bigint values
          const extractBigInt = (value: any): bigint | undefined => {
            if (value === undefined || value === null) return undefined;
            try {
              return BigInt(value.toString());
            } catch {
              return undefined;
            }
          };
          
          // Iterate through the tuple components to extract all parameters
          firstInput.components?.forEach((component: any, index: number) => {
            const value = params[index] !== undefined ? params[index] : params[component.name];
            
            if (value === undefined) return;
            
            // Map parameter names to our standard names
            switch (component.name) {
              case 'amountIn':
              case 'amountInMaximum':
                const amountInVal = extractBigInt(value);
                if (amountInVal !== undefined) parameters.amountIn = amountInVal;
                break;
              case 'amountOutMinimum':
              case 'amountOut':
                const amountOutVal = extractBigInt(value);
                if (amountOutVal !== undefined) parameters.amountOutMin = amountOutVal;
                break;
              case 'recipient':
                parameters.recipient = value.toString();
                break;
              case 'deadline':
                parameters.deadline = Number(value);
                break;
              case 'path':
                parameters.path = value;
                break;
              case 'tokenIn':
                parameters.tokenIn = value.toString();
                break;
              case 'tokenOut':
                parameters.tokenOut = value.toString();
                break;
              case 'fee':
                parameters.fee = Number(value);
                break;
              default:
                // Store other parameters with their original names
                parameters[component.name] = value;
            }
          });
        } else {
          // For functions with direct parameters (like multicall)
          parsed.args.forEach((arg, index) => {
            const paramName = parsed.fragment.inputs[index]?.name || `param${index}`;
            if (typeof arg === 'bigint' || typeof arg === 'number') {
              parameters[paramName] = arg;
            } else if (typeof arg === 'string') {
              parameters[paramName] = arg;
            } else if (Array.isArray(arg)) {
              parameters[paramName] = arg;
            } else {
              parameters[paramName] = arg;
            }
          });
        }
      }

      return {
        hash: txHash,
        from,
        to,
        value: BigInt(value),
        functionName: parsed.name,
        parameters,
      };
    } catch (error) {
      console.error(`Failed to decode transaction ${txHash}:`, error);
      return null;
    }
  }

  /**
   * Checks if the decoded function is a swap operation
   * Swap functions include: exactInputSingle, exactInput, exactOutputSingle, exactOutput
   */
  isSwapFunction(functionName: string): boolean {
    const swapFunctions = [
      'exactInputSingle',
      'exactInput',
      'exactOutputSingle',
      'exactOutput',
    ];
    return swapFunctions.includes(functionName);
  }
}
