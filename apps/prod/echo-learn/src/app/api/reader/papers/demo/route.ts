/**
 * Demo Papers API
 *
 * POST: Add a demo paper to the user's library
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { randomUUID } from 'crypto';

// Demo paper definitions
const DEMO_PAPERS: Record<string, {
  title: string;
  authors: string[];
  year: number;
  journal: string;
  abstract: string;
  doi: string;
  sections: Array<{ name: string; type: string; content: string }>;
  keywords: string[];
}> = {
  'demo-attention': {
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Lukasz Kaiser', 'Illia Polosukhin'],
    year: 2017,
    journal: 'NeurIPS',
    doi: '10.48550/arXiv.1706.03762',
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    keywords: ['transformer', 'attention', 'neural networks', 'NLP', 'deep learning'],
    sections: [
      {
        name: 'Introduction',
        type: 'introduction',
        content: `Recurrent neural networks, long short-term memory and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. Numerous efforts have since continued to push the boundaries of recurrent language models and encoder-decoder architectures.

Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states ht, as a function of the previous hidden state ht-1 and the input for position t. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.

Attention mechanisms have become an integral part of compelling sequence modeling and transduction models in various tasks, allowing modeling of dependencies without regard to their distance in the input or output sequences. In all but a few cases, however, such attention mechanisms are used in conjunction with a recurrent network.

In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output. The Transformer allows for significantly more parallelization and can reach a new state of the art in translation quality.`
      },
      {
        name: 'Model Architecture',
        type: 'methods',
        content: `Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations to a sequence of continuous representations. Given z, the decoder then generates an output sequence of symbols one element at a time.

The Transformer follows this overall architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder.

Encoder: The encoder is composed of a stack of N = 6 identical layers. Each layer has two sub-layers. The first is a multi-head self-attention mechanism, and the second is a simple, position-wise fully connected feed-forward network. We employ a residual connection around each of the two sub-layers, followed by layer normalization.

Decoder: The decoder is also composed of a stack of N = 6 identical layers. In addition to the two sub-layers in each encoder layer, the decoder inserts a third sub-layer, which performs multi-head attention over the output of the encoder stack. Similar to the encoder, we employ residual connections around each of the sub-layers, followed by layer normalization.`
      },
      {
        name: 'Attention',
        type: 'methods',
        content: `An attention function can be described as mapping a query and a set of key-value pairs to an output, where the query, keys, values, and output are all vectors. The output is computed as a weighted sum of the values, where the weight assigned to each value is computed by a compatibility function of the query with the corresponding key.

Scaled Dot-Product Attention: We call our particular attention "Scaled Dot-Product Attention". The input consists of queries and keys of dimension dk, and values of dimension dv. We compute the dot products of the query with all keys, divide each by the square root of dk, and apply a softmax function to obtain the weights on the values.

Multi-Head Attention: Instead of performing a single attention function with dmodel-dimensional keys, values and queries, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections. On each of these projected versions, we perform the attention function in parallel, yielding dv-dimensional output values.`
      },
      {
        name: 'Results',
        type: 'results',
        content: `On the WMT 2014 English-to-German translation task, the big transformer model outperforms the best previously reported models including ensembles by more than 2.0 BLEU, establishing a new state-of-the-art BLEU score of 28.4. Training took 3.5 days on 8 P100 GPUs.

On the WMT 2014 English-to-French translation task, our big model achieves a BLEU score of 41.0, outperforming all of the previously published single models, at less than 1/4 the training cost of the previous state-of-the-art model.

The Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. We trained the base models for a total of 100,000 steps or 12 hours on 8 P100 GPUs, while the big models were trained for 300,000 steps (3.5 days).`
      },
      {
        name: 'Conclusion',
        type: 'conclusion',
        content: `In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention.

For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieve a new state of the art.

We are excited about the future of attention-based models and plan to apply them to other tasks. We plan to extend the Transformer to problems involving input and output modalities other than text and to investigate local, restricted attention mechanisms to efficiently handle large inputs and outputs such as images, audio and video.`
      }
    ]
  },
  'demo-bert': {
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    year: 2018,
    journal: 'NAACL-HLT',
    doi: '10.48550/arXiv.1810.04805',
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    keywords: ['BERT', 'pre-training', 'transformers', 'NLP', 'language model'],
    sections: [
      {
        name: 'Introduction',
        type: 'introduction',
        content: `Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include sentence-level tasks such as natural language inference and paraphrasing, which aim to predict the relationships between sentences by analyzing them holistically, as well as token-level tasks such as named entity recognition and question answering, where models are required to produce fine-grained output at the token level.

There are two existing strategies for applying pre-trained language representations to downstream tasks: feature-based and fine-tuning. The feature-based approach, such as ELMo, uses task-specific architectures that include the pre-trained representations as additional features. The fine-tuning approach, such as the Generative Pre-trained Transformer (OpenAI GPT), introduces minimal task-specific parameters, and is trained on the downstream tasks by simply fine-tuning all pre-trained parameters.

We argue that current techniques restrict the power of the pre-trained representations, especially for the fine-tuning approaches. The major limitation is that standard language models are unidirectional, and this limits the choice of architectures that can be used during pre-training.`
      },
      {
        name: 'BERT Model',
        type: 'methods',
        content: `BERT's model architecture is a multi-layer bidirectional Transformer encoder based on the original implementation described in Vaswani et al. (2017).

We denote the number of layers (i.e., Transformer blocks) as L, the hidden size as H, and the number of self-attention heads as A. We primarily report results on two model sizes: BERT-BASE (L=12, H=768, A=12, Total Parameters=110M) and BERT-LARGE (L=24, H=1024, A=16, Total Parameters=340M).

Input/Output Representations: To make BERT handle a variety of down-stream tasks, our input representation is able to unambiguously represent both a single sentence and a pair of sentences in one token sequence. We use WordPiece embeddings with a 30,000 token vocabulary. The first token of every sequence is always a special classification token ([CLS]).`
      },
      {
        name: 'Pre-training BERT',
        type: 'methods',
        content: `We pre-train BERT using two unsupervised tasks:

Masked Language Model (MLM): In order to train a deep bidirectional representation, we simply mask some percentage of the input tokens at random, and then predict those masked tokens. We refer to this procedure as a "masked LM" (MLM). In this case, the final hidden vectors corresponding to the mask tokens are fed into an output softmax over the vocabulary.

Next Sentence Prediction (NSP): Many important downstream tasks such as Question Answering (QA) and Natural Language Inference (NLI) are based on understanding the relationship between two sentences. In order to train a model that understands sentence relationships, we pre-train for a binarized next sentence prediction task.

Pre-training data: The pre-training procedure largely follows the existing literature on language model pre-training. For the pre-training corpus we use the BooksCorpus (800M words) and English Wikipedia (2,500M words).`
      },
      {
        name: 'Results',
        type: 'results',
        content: `We present results on eleven NLP tasks:

GLUE Benchmark: The General Language Understanding Evaluation (GLUE) benchmark is a collection of diverse natural language understanding tasks. BERT-LARGE outperforms all systems on all tasks by a substantial margin, obtaining 4.5% and 7.0% respective average accuracy improvement over the prior state of the art.

SQuAD v1.1: The Stanford Question Answering Dataset (SQuAD v1.1) is a collection of 100k crowdsourced question/answer pairs. BERT achieves an F1 score of 93.2, surpassing human performance.

SQuAD v2.0: The SQuAD 2.0 task extends the SQuAD 1.1 problem definition by allowing for the possibility that no short answer exists in the provided paragraph. We use a simple approach to extend the SQuAD v1.1 BERT model for this task.

Named Entity Recognition: To evaluate performance on a token tagging task, we fine-tune BERT on the CoNLL-2003 Named Entity Recognition (NER) dataset.`
      },
      {
        name: 'Conclusion',
        type: 'conclusion',
        content: `Recent empirical improvements due to transfer learning with language models have demonstrated that rich, unsupervised pre-training is an integral part of many language understanding systems. In particular, these results enable even low-resource tasks to benefit from deep unidirectional architectures.

Our major contribution is further generalizing these findings to deep bidirectional architectures, allowing the same pre-trained model to successfully tackle a broad set of NLP tasks.

While the empirical results are strong, in some cases surpassing human performance, important future work includes investigating whether BERT can be used for text generation tasks.`
      }
    ]
  }
};

export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const userId = req.user.userId;
      const { demoId } = await request.json();

      if (!demoId || !DEMO_PAPERS[demoId]) {
        return NextResponse.json(
          { error: 'Invalid demo paper ID' },
          { status: 400 }
        );
      }

      const demo = DEMO_PAPERS[demoId];
      const db = getResearchDb();

      // Check if user already has this demo paper
      const existing = await db.execute({
        sql: `SELECT paper_id FROM reader_papers
              WHERE uploaded_by_user_id = ? AND title = ?`,
        args: [userId, demo.title],
      });

      if (existing.rows.length > 0) {
        // Already exists, return the paper ID
        return NextResponse.json({
          success: true,
          paperId: existing.rows[0].paper_id,
          message: 'Demo paper already in your library',
        });
      }

      // Create the paper
      const paperId = `paper_${randomUUID()}`;
      const now = new Date().toISOString();

      await db.execute({
        sql: `INSERT INTO reader_papers
              (paper_id, uploaded_by_user_id, title, authors, publication_year, journal, abstract, doi, processing_status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, ?)`,
        args: [
          paperId,
          userId,
          demo.title,
          JSON.stringify(demo.authors.map(name => ({ name }))),
          demo.year,
          demo.journal,
          demo.abstract,
          demo.doi,
          now,
          now,
        ],
      });

      // Create sections
      console.log(`[Demo Papers] Creating ${demo.sections.length} sections for paper ${paperId}`);
      for (let i = 0; i < demo.sections.length; i++) {
        const section = demo.sections[i];
        const sectionId = `section_${randomUUID()}`;

        try {
          await db.execute({
            sql: `INSERT INTO reader_sections
                  (section_id, paper_id, section_name, section_type, content, section_order)
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [
              sectionId,
              paperId,
              section.name,
              section.type,
              section.content,
              i + 1,
            ],
          });
          console.log(`[Demo Papers] Created section ${i + 1}: ${section.name}`);
        } catch (sectionError) {
          console.error(`[Demo Papers] Failed to create section ${section.name}:`, sectionError);
          throw sectionError;
        }
      }

      // Verify sections were created
      const verifyResult = await db.execute({
        sql: `SELECT COUNT(*) as count FROM reader_sections WHERE paper_id = ?`,
        args: [paperId],
      });
      const sectionCount = (verifyResult.rows[0] as any)?.count || 0;
      console.log(`[Demo Papers] Verification: ${sectionCount} sections found for paper ${paperId}`);

      // Create keywords
      for (const keyword of demo.keywords) {
        await db.execute({
          sql: `INSERT INTO reader_keywords (paper_id, keyword) VALUES (?, ?)`,
          args: [paperId, keyword],
        });
      }

      return NextResponse.json({
        success: true,
        paperId,
        sectionCount,
        message: `Demo paper added with ${sectionCount} sections`,
      });
    } catch (error) {
      console.error('[Demo Papers] Error:', error);
      return NextResponse.json(
        { error: 'Failed to add demo paper' },
        { status: 500 }
      );
    }
  });
}
