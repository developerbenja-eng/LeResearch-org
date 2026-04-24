/**
 * Echo Reader - Test Seed API (Development Only)
 *
 * POST: Create a test paper for development/testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchDb } from '@/lib/db/turso';
import { randomUUID } from 'crypto';

// Only allow in development
const isDev = process.env.NODE_ENV !== 'production';

export async function POST(request: NextRequest) {
  if (!isDev) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const db = getResearchDb();
    const paperId = randomUUID();
    const userId = 'test-user-' + Date.now();

    // Create test paper
    await db.execute({
      sql: `INSERT INTO reader_papers (
        paper_id,
        title,
        authors,
        abstract,
        doi,
        publication_year,
        uploaded_by_user_id,
        processing_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        paperId,
        'Machine Learning Fundamentals: A Comprehensive Overview',
        JSON.stringify([{ name: 'Dr. Test Author', affiliation: 'Test University' }]),
        'This paper provides a comprehensive overview of machine learning fundamentals, covering supervised learning, unsupervised learning, and reinforcement learning. We discuss key algorithms including linear regression, decision trees, neural networks, and clustering methods. The paper also covers evaluation metrics, cross-validation, and best practices for model selection.',
        '10.1234/test.ml.2024',
        2024,
        userId,
        'completed',
      ],
    });

    // Create test sections
    const sections = [
      {
        name: 'Introduction',
        order: 1,
        content: `Machine learning has revolutionized how we approach complex problems in computer science and data science. This paper introduces the fundamental concepts that every practitioner should understand.

We will explore how machines can learn from data without being explicitly programmed, and how this capability has transformed industries from healthcare to finance. The rise of big data and increased computational power has made machine learning more accessible and powerful than ever before.

Key questions we will address include: What distinguishes machine learning from traditional programming? How do we choose between different algorithms? And what are the best practices for building reliable models?`,
      },
      {
        name: 'Supervised Learning',
        order: 2,
        content: `Supervised learning involves training a model on labeled data, where the correct output is known for each input. This is the most common type of machine learning and forms the foundation for many practical applications.

Key algorithms include:
- Linear regression for continuous outputs (predicting house prices, stock values)
- Logistic regression for binary classification (spam detection, medical diagnosis)
- Decision trees for interpretable models
- Random forests for robust ensemble predictions
- Neural networks for complex patterns

The goal is to learn a mapping from inputs to outputs that generalizes well to unseen data. This requires careful attention to overfitting, proper validation strategies, and feature engineering.`,
      },
      {
        name: 'Unsupervised Learning',
        order: 3,
        content: `Unlike supervised learning, unsupervised learning works with unlabeled data to discover hidden patterns and structures. This is particularly valuable when labeled data is expensive or unavailable.

Major techniques include:
- K-means clustering: Groups similar data points together based on distance metrics
- Hierarchical clustering: Builds a tree of clusters at different granularities
- PCA (Principal Component Analysis): Reduces dimensionality while preserving variance
- Autoencoders: Neural networks that learn compressed representations

These techniques are invaluable for exploratory data analysis, anomaly detection, and feature engineering. They help us understand the underlying structure of our data before applying supervised methods.`,
      },
      {
        name: 'Evaluation and Best Practices',
        order: 4,
        content: `Proper evaluation is critical for building reliable machine learning models. We must ensure our models perform well not just on training data, but on new, unseen data.

Key concepts include:
- Train/validation/test splits: Never evaluate on training data
- Cross-validation: More robust performance estimates
- Metrics: Accuracy, precision, recall, F1-score, ROC-AUC
- Bias-variance tradeoff: Understanding model complexity

Best practices:
1. Start with simple models and add complexity as needed
2. Always use proper cross-validation
3. Monitor for data leakage
4. Document your experiments
5. Consider interpretability requirements`,
      },
      {
        name: 'Conclusion',
        order: 5,
        content: `Machine learning continues to evolve rapidly, with new techniques and applications emerging regularly. Understanding the fundamentals covered in this paper provides a solid foundation for exploring more advanced topics.

Key takeaways:
1. Supervised learning is the workhorse of practical ML applications
2. Unsupervised learning reveals hidden structure in data
3. Proper evaluation prevents overfitting and ensures generalization
4. The field is moving fast - continuous learning is essential

The future of machine learning looks incredibly promising, with advances in deep learning, reinforcement learning, and automated machine learning making these techniques more powerful and accessible than ever before.`,
      },
    ];

    for (const section of sections) {
      const sectionId = randomUUID();
      await db.execute({
        sql: `INSERT INTO reader_sections (
          section_id,
          paper_id,
          section_name,
          section_order,
          content
        ) VALUES (?, ?, ?, ?, ?)`,
        args: [
          sectionId,
          paperId,
          section.name,
          section.order,
          section.content,
        ],
      });
    }

    return NextResponse.json({
      success: true,
      paperId,
      userId,
      message: 'Test paper created successfully',
      sections: sections.length,
    });
  } catch (error: any) {
    console.error('[Test Seed] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test data' },
      { status: 500 }
    );
  }
}
