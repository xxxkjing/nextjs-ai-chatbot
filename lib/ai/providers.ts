import { openai } from '@ai-sdk/openai';
import { type LanguageModelV1 } from '@ai-sdk/provider';
import { createResumableStreamContext } from 'resumable-stream';
import { getStreamContext } from '@/app/(chat)/api/chat/route';
import { DEFAULT_CHAT_MODEL } from './models';

// Create a stream context for resumable streaming
const streamContext = getStreamContext();

/**
 * Provider configuration for AI models
 * 
 * This configuration supports:
 * - OpenAI compatible API endpoints (for Gemini and other models)
 * - xAI (Grok) models
 * - Standard OpenAI models
 */
export const myProvider = {
  /**
   * Creates a language model instance based on the model ID
   * 
   * @param modelId - The ID of the model to use
   * @returns A LanguageModelV1 instance
   */
  languageModel: (modelId: string): LanguageModelV1 => {
    // Check if we're using an OpenAI compatible endpoint for Gemini
    const isGeminiModel = modelId.includes('gemini');
    
    // Get API key and base URL from environment variables
    const apiKey = process.env.GEMINI_API_KEY || 
                  process.env.OPENAI_API_KEY || 
                  process.env.XAI_API_KEY;
    
    // Clean and validate the base URL (remove any trailing spaces)
    let baseURL = process.env.OPENAI_BASE_URL?.trim() || 
                 process.env.XAI_API_BASE_URL;
    
    // Ensure proper URL format for OpenAI compatible endpoints
    if (isGeminiModel && baseURL) {
      // Make sure URL ends correctly and doesn't have extra spaces
      baseURL = baseURL.replace(/\s+$/, '');
      
      // Ensure URL ends with /v1 (standard OpenAI API path)
      if (!baseURL.endsWith('/v1')) {
        baseURL = baseURL.endsWith('/') ? `${baseURL}v1` : `${baseURL}/v1`;
      }
    }

    // Configure for OpenAI compatible endpoints (Gemini)
    if (isGeminiModel && process.env.GEMINI_API_KEY) {
      return openai(modelId, {
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL?.trim(),
        compatibility: 'strict', // Use strict OpenAI compatibility mode
        streamContext,
      });
    }
    
    // Configure for xAI (Grok)
    if (process.env.XAI_API_KEY) {
      return openai(modelId, {
        apiKey: process.env.XAI_API_KEY,
        baseURL: process.env.XAI_API_BASE_URL || 'https://api.x.ai/v1',
        compatibility: 'strict',
        streamContext,
      });
    }
    
    // Default to standard OpenAI configuration
    return openai(modelId, {
      apiKey,
      streamContext,
    });
  },

  /**
   * Creates a title generation model
   * 
   * @returns A LanguageModelV1 instance for title generation
   */
  titleModel: (): LanguageModelV1 => {
    // Use the default chat model for title generation
    return myProvider.languageModel(DEFAULT_CHAT_MODEL);
  },
  
  /**
   * Creates an artifact generation model
   * 
   * @returns A LanguageModelV1 instance for artifact generation
   */
  artifactModel: (): LanguageModelV1 => {
    // Use the default chat model for artifact generation
    return myProvider.languageModel(DEFAULT_CHAT_MODEL);
  }
};
