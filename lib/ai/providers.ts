import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

// 初始化 OpenAI Provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_BASE_URL!,
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openai(process.env.OPENAI_DEFAULT_MODEL || 'gpt-4'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai(process.env.OPENAI_REASONING_MODEL || 'gpt-4'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai(process.env.OPENAI_TITLE_MODEL || 'gpt-3.5-turbo'),
        'artifact-model': openai(
          process.env.OPENAI_ARTIFACT_MODEL || 'gpt-3.5-turbo'
        ),
      },
      imageModels: {
        'small-model': openai.imageModel(
          process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
        ),
      },
    });
