import { NextRequest, NextResponse } from 'next/server';
import { withLinguaAuth } from '@/lib/lingua/middleware';
import { generateInsightSet, shouldGenerateInsights } from '@/lib/lingua/coach/insight-generator';
import { calculateLearningProfile, getLearningProfile } from '@/lib/lingua/tracking/analyzer';

/**
 * POST /api/lingua/coach/insights/generate
 * Generate new insights for authenticated user
 */
export async function POST(request: NextRequest) {
  return withLinguaAuth(request, async (req, session) => {
    try {
      // Check if we should generate new insights
      const shouldGenerate = await shouldGenerateInsights(session.userId);

      if (!shouldGenerate) {
        return NextResponse.json({
          success: true,
          message: 'Not enough new data to generate insights yet',
          insights: [],
        });
      }

      // Get or calculate learning profile
      let profile = await getLearningProfile(session.userId);

      if (!profile) {
        // Calculate profile for the first time
        profile = await calculateLearningProfile(session.userId);
      }

      // Generate insights
      const insights = await generateInsightSet(session.userId, profile);

      return NextResponse.json({
        success: true,
        insights,
        profile: {
          visualLearning: profile.visualLearning,
          verbalLearning: profile.verbalLearning,
          kinestheticLearning: profile.kinestheticLearning,
          analyticalLearning: profile.analyticalLearning,
          learningApproach: profile.learningApproach,
          confidenceLevel: profile.confidenceLevel,
        },
      });
    } catch (error) {
      console.error('Error generating insights:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to generate insights',
        },
        { status: 500 }
      );
    }
  });
}
