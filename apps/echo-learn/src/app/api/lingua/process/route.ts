import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import {
  parseConversation,
  extractWords,
  detectLanguage,
  getUniqueWords,
} from '@/lib/lingua/parser';
import {
  getVocabulary,
  upsertWord,
  saveConversation,
  updateUserActivity,
} from '@/lib/lingua/db';
import { batchTranslate } from '@/lib/lingua/ai';
import { ProcessConversationRequest, ExtractedWord, ParsedMessage } from '@/types/lingua';
import { normalizeWord } from '@/lib/lingua/parser';

/**
 * POST /api/lingua/process
 * Parse and process a pasted conversation
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      const body = (await req.json()) as ProcessConversationRequest;
      const { text, saveConversation: shouldSave } = body;

      if (!text || text.trim().length === 0) {
        return NextResponse.json(
          { error: 'Text is required' },
          { status: 400 }
        );
      }

      // Parse the conversation
      const messages = parseConversation(text);

      if (messages.length === 0) {
        return NextResponse.json(
          { error: 'No messages could be parsed from the text' },
          { status: 400 }
        );
      }

      // Get user's existing vocabulary
      const existingVocab = await getVocabulary(session.userId, { limit: 10000 });
      const vocabMap = new Map(
        existingVocab.map((v) => [v.word_normalized, v])
      );

      // Process each message
      const allWords: ExtractedWord[] = [];
      const wordsToTranslate: string[] = [];
      const processedMessages: ParsedMessage[] = [];

      for (const message of messages) {
        // Detect language of the message
        const messageLanguage = detectLanguage(message.content);

        // Only extract words from messages in the user's target language
        // (these are the words they're trying to learn)
        const isTargetLanguage = messageLanguage === session.targetLang;

        if (isTargetLanguage) {
          const messageWords = extractWords(message.content, messageLanguage);

          for (const word of messageWords) {
            const existing = vocabMap.get(word.normalized);

            if (existing) {
              word.vocabEntry = existing;
              word.showInTargetLang = existing.status === 'known';
            } else {
              // New word - collect for batch translation
              if (!wordsToTranslate.includes(word.original.toLowerCase())) {
                wordsToTranslate.push(word.original.toLowerCase());
              }
            }

            allWords.push(word);
          }

          message.words = messageWords;
        } else {
          // Message is in user's native language - no words to learn
          message.words = [];
        }

        processedMessages.push(message);
      }

      // Get unique words for the response
      const uniqueWordsMap = getUniqueWords(allWords);
      const uniqueWords = Array.from(uniqueWordsMap.values());

      // Batch translate new words
      let translations = new Map<string, string>();
      if (wordsToTranslate.length > 0) {
        translations = await batchTranslate(
          wordsToTranslate,
          session.targetLang,
          session.nativeLang
        );
      }

      // Add new words to vocabulary
      let newWordsCount = 0;
      for (const word of uniqueWords) {
        if (!word.vocabEntry) {
          const translation = translations.get(word.normalized) || undefined;
          await upsertWord(session.userId, word.original, word.normalized, translation);
          newWordsCount++;
        }
      }

      // Update user activity for streak
      await updateUserActivity(session.userId);

      // Save conversation if requested
      let conversationId: string | undefined;
      if (shouldSave) {
        const conversation = await saveConversation(
          session.userId,
          text,
          JSON.stringify(processedMessages),
          allWords.length,
          newWordsCount
        );
        conversationId = conversation.id;
      }

      return NextResponse.json({
        success: true,
        messages: processedMessages,
        words: uniqueWords,
        newWordsCount,
        totalWords: uniqueWords.length,
        conversationId,
      });
    } catch (error) {
      console.error('Error processing conversation:', error);
      return NextResponse.json(
        { error: 'Failed to process conversation' },
        { status: 500 }
      );
    }
  });
}
