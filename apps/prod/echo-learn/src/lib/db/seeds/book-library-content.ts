/**
 * Book Library Content — LLM-generated educational content for each book
 *
 * Each entry contains structured content sections:
 * - overview: What the book is about and its core thesis
 * - key_concepts: The 5-8 main ideas, reframed for practical use
 * - age_takeaways: How to apply concepts at different child ages
 * - activities: Practical activities parents can try at home
 * - is_for_me: Quick guide to help parents decide if this book matches their needs
 *
 * NOTE: This content is generated from LLM knowledge, NOT copied from the books.
 * It is transformative, educational content — summaries and practical reframings.
 * As we acquire physical copies, content will be verified and expanded (is_verified flag).
 */

export interface BookContentEntry {
  book_slug: string;
  overview: string;
  key_concepts: BookKeyConcept[];
  age_takeaways: BookAgeTakeaway[];
  activities: BookActivity[];
  is_for_me: BookIsForMe;
  related_approaches?: string[];
  related_topics?: string[];
}

export interface BookKeyConcept {
  title: string;
  summary: string;
  practical_tip: string;
}

export interface BookAgeTakeaway {
  age_range: string;
  applicable: boolean;
  takeaway: string;
}

export interface BookActivity {
  name: string;
  age_range: string;
  description: string;
  materials?: string;
  time_needed: string;
}

export interface BookIsForMe {
  best_for: string[];
  not_ideal_for: string[];
  reading_time: string;
  difficulty: 'easy' | 'moderate' | 'academic';
  one_line: string;
}

export const BOOK_CONTENT: BookContentEntry[] = [
  // ══════════════════════════════════════════════════════════════════════
  // CORE PARENTING & CHILD DEVELOPMENT
  // ══════════════════════════════════════════════════════════════════════
  {
    book_slug: 'the-whole-brain-child',
    overview: 'The Whole-Brain Child reveals how a child\'s brain is wired and how it matures. By understanding the different parts of the brain — the logical left brain and emotional right brain, the reactive "downstairs brain" and thoughtful "upstairs brain" — parents can turn everyday challenges into opportunities for brain integration. The core message: when different parts of the brain work together, children (and adults) function at their best emotionally, intellectually, and socially.',
    key_concepts: [
      {
        title: 'Connect and Redirect',
        summary: 'When your child is upset, first connect emotionally (right brain to right brain) before trying to reason or redirect (left brain). Logic doesn\'t work when the emotional brain is flooded.',
        practical_tip: 'During a meltdown, get on their level, use a warm tone, and acknowledge the feeling ("You\'re really angry about that") before offering solutions.',
      },
      {
        title: 'Name It to Tame It',
        summary: 'Helping children put words to their emotions activates the left brain and calms the reactive right brain. Storytelling about difficult experiences helps integrate the memory.',
        practical_tip: 'After an upsetting event, ask your child to tell you the story of what happened. Narrating the experience helps the brain process and file it properly.',
      },
      {
        title: 'Engage, Don\'t Enrage',
        summary: 'The "upstairs brain" (prefrontal cortex) handles reasoning, empathy, and self-control but isn\'t fully developed until the mid-20s. Threats and punishment trigger the "downstairs brain" (fight/flight).',
        practical_tip: 'Instead of "Go to your room right now!" try "I can see you\'re overwhelmed. What do you think we could do about this?"',
      },
      {
        title: 'Use It or Lose It',
        summary: 'The upstairs brain is like a muscle — it strengthens with exercise. Every time you ask a child to consider consequences, manage emotions, or think of others, you\'re building their prefrontal cortex.',
        practical_tip: 'Ask "What\'s your plan?" instead of giving orders. This exercises decision-making, planning, and self-regulation circuits.',
      },
      {
        title: 'Move It or Lose It',
        summary: 'Physical movement can shift emotional states rapidly. When the body moves, brain chemistry changes — stress hormones decrease and feel-good neurotransmitters increase.',
        practical_tip: 'When your child is stuck in a negative emotional state, suggest a physical activity: "Let\'s go jump on the trampoline" or "Race you to the mailbox."',
      },
      {
        title: 'The Wheel of Awareness',
        summary: 'Teaching children that they can observe their own thoughts and feelings without being controlled by them. The "hub" of awareness can focus on different "rim" elements — sensations, thoughts, feelings.',
        practical_tip: 'Help your child notice: "You\'re feeling scared right now. That\'s just one feeling on your wheel. What else do you notice? Is your body tense? What are you thinking?"',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Focus on emotional attunement and narrating experiences. "Name it to tame it" works even with pre-verbal babies through your tone and facial expressions.' },
      { age_range: '3-5', applicable: true, takeaway: 'Prime age for these strategies. Use storytelling to process big feelings, teach basic emotion vocabulary, and practice "connect and redirect" during tantrums.' },
      { age_range: '6-9', applicable: true, takeaway: 'Children can now understand the brain concepts themselves. Teach them about their "upstairs" and "downstairs" brain — they love knowing why they "flip their lid."' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens can use the Wheel of Awareness as a mindfulness tool. Help them understand that their changing brains are building important circuits.' },
      { age_range: '13+', applicable: true, takeaway: 'Teens benefit from understanding why they\'re more emotional and impulsive — it\'s brain development, not character flaw. This knowledge builds self-compassion.' },
    ],
    activities: [
      {
        name: 'Brain in the Palm of Your Hand',
        age_range: '5-12',
        description: 'Teach the hand model of the brain. Make a fist with your thumb tucked inside — the thumb is the "downstairs brain" (emotions) and the fingers folded over are the "upstairs brain" (thinking). When we "flip our lid" (open fingers), the thinking brain disconnects from the emotional brain.',
        time_needed: '5 minutes',
      },
      {
        name: 'Story Time Processing',
        age_range: '3-10',
        description: 'After a difficult experience, ask your child to draw or narrate what happened from beginning to end. Help them identify what they felt at each point. This integrates left-brain narrative with right-brain emotion.',
        materials: 'Paper, crayons',
        time_needed: '15-20 minutes',
      },
      {
        name: 'Feelings Wheel Check-In',
        age_range: '6-12',
        description: 'Create a daily "feelings wheel" where the child draws or places stickers on different emotions they experienced that day. This builds emotional vocabulary and the habit of self-reflection.',
        materials: 'Printed wheel template, stickers or markers',
        time_needed: '5 minutes daily',
      },
      {
        name: 'The Calm-Down Toolbox',
        age_range: '3-8',
        description: 'Together with your child, create a physical box filled with calming tools: a stress ball, a glitter jar, favorite photos, a scented cloth, noise-canceling headphones. When emotions run high, they can choose a tool from the box.',
        materials: 'Box, various calming items',
        time_needed: '30 minutes to create, ongoing use',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents who want to understand WHY their child acts the way they do',
        'Anyone dealing with meltdowns, tantrums, or emotional outbursts',
        'Parents interested in brain science made practical',
        'Caregivers who want to turn discipline moments into teaching moments',
      ],
      not_ideal_for: [
        'Parents looking for specific behavioral scripts (this is more framework-level)',
        'Those seeking academic-level neuroscience (this is simplified for practical use)',
      ],
      reading_time: '4-5 hours',
      difficulty: 'easy',
      one_line: 'If you read one parenting book about brain development, make it this one.',
    },
    related_approaches: ['montessori', 'waldorf-steiner', 'reggio-emilia'],
    related_topics: ['emotional-regulation', 'tantrums-meltdowns', 'brain-development', 'discipline-strategies'],
  },

  {
    book_slug: 'parenting-from-the-inside-out',
    overview: 'This book explores how our own childhood experiences — especially unresolved emotional issues — unconsciously shape how we parent. Siegel and Hartzell combine attachment research with neuroscience to show that making sense of your own story is the single best predictor of your child\'s secure attachment. It\'s not about having a perfect childhood, but about understanding and integrating your experiences.',
    key_concepts: [
      {
        title: 'Your Story Shapes Your Parenting',
        summary: 'How you were parented creates neural patterns that automatically activate when you parent. Unresolved childhood experiences lead to reactive, confusing parenting behaviors.',
        practical_tip: 'When you find yourself overreacting to your child, pause and ask: "Is this about what my child just did, or is this about something from my own past?"',
      },
      {
        title: 'Earned Secure Attachment',
        summary: 'You don\'t need a perfect childhood to be a great parent. By making sense of your experiences — even difficult ones — you can develop "earned secure attachment" and break negative cycles.',
        practical_tip: 'Write or talk about your childhood memories, especially the hard ones. The goal isn\'t to blame your parents but to understand patterns you may be repeating.',
      },
      {
        title: 'The Low Road vs. The High Road',
        summary: 'The "low road" is our automatic, reactive response (yelling, withdrawing). The "high road" involves the prefrontal cortex and allows for thoughtful, intentional responses.',
        practical_tip: 'Create a personal pause practice. When you feel triggered, name it: "I\'m on the low road right now." Take 3 breaths before responding.',
      },
      {
        title: 'Rupture and Repair',
        summary: 'Perfect parenting isn\'t the goal — repair is. When you lose your temper or make a mistake, the repair process actually strengthens your relationship and teaches resilience.',
        practical_tip: 'After a parenting "miss," come back to your child: "I yelled, and that wasn\'t okay. I was frustrated, but you didn\'t deserve that. I\'m sorry."',
      },
      {
        title: 'Mindsight — Seeing Your Own Mind',
        summary: 'The ability to observe your own thoughts, feelings, and reactions without being controlled by them. This self-awareness is the foundation of intentional parenting.',
        practical_tip: 'Practice describing your inner experience in real-time: "I notice I\'m feeling tense. My jaw is tight. I\'m starting to feel angry."',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'This period powerfully triggers your own attachment patterns. Notice when your baby\'s crying activates unexpected emotions — that\'s information about your own history.' },
      { age_range: '3-5', applicable: true, takeaway: 'Toddler defiance often triggers our own childhood experiences with authority. Use these moments as signals to explore your own story.' },
      { age_range: '6-9', applicable: true, takeaway: 'As children develop more independence, notice if you feel anxious or controlling. These reactions often stem from your own childhood experiences with autonomy.' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens pushing boundaries can reactivate your own adolescent memories. Stay curious about what gets triggered in you.' },
      { age_range: '13+', applicable: true, takeaway: 'Teen separation can feel like rejection if you experienced abandonment in childhood. Understanding this helps you support their healthy independence.' },
    ],
    activities: [
      {
        name: 'Life Narrative Timeline',
        age_range: 'Parents',
        description: 'Draw a timeline of your childhood. Mark positive and negative experiences. For each, write: What happened? How did I feel? How did my parents respond? How does this affect my parenting today?',
        materials: 'Paper, pen',
        time_needed: '45-60 minutes',
      },
      {
        name: 'Trigger Journal',
        age_range: 'Parents',
        description: 'For one week, note every time you have a disproportionate reaction to your child. Write: What happened? What did I feel? What did this remind me of from my past? This builds awareness of your patterns.',
        materials: 'Notebook or phone',
        time_needed: '5 minutes daily',
      },
      {
        name: 'Repair Practice',
        age_range: 'All ages',
        description: 'After a parenting "miss," practice the 4-step repair: 1) Acknowledge what happened 2) Take responsibility 3) Express understanding of their experience 4) Commit to doing better.',
        time_needed: '5-10 minutes',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents who notice themselves repeating patterns from their own childhood',
        'Anyone who finds themselves overreacting to their child\'s behavior',
        'Parents who had difficult childhoods and want to break the cycle',
        'Those interested in understanding the "why" behind their parenting reactions',
      ],
      not_ideal_for: [
        'Parents looking for quick behavioral fixes (this is deeper, self-reflective work)',
        'Those uncomfortable with examining their own childhood experiences',
      ],
      reading_time: '6-8 hours',
      difficulty: 'moderate',
      one_line: 'The most important parenting work happens inside the parent, not the child.',
    },
    related_approaches: ['rie', 'attachment-parenting'],
    related_topics: ['attachment', 'emotional-regulation', 'parental-self-care', 'intergenerational-patterns'],
  },

  {
    book_slug: 'how-to-talk-so-kids-will-listen',
    overview: 'The definitive communication guide for parents. Faber and Mazlish provide concrete tools for engaging cooperation, handling feelings, using alternatives to punishment, encouraging autonomy, and using praise effectively. What makes this book special is the comic-strip style examples showing both the wrong and right way to communicate — making the concepts immediately usable.',
    key_concepts: [
      {
        title: 'Acknowledge Feelings First',
        summary: 'Children cooperate better when they feel understood. Instead of dismissing or fixing feelings ("You\'re fine!"), acknowledge them with words, sounds, or writing.',
        practical_tip: 'When your child says "I hate my brother!" resist correcting. Instead: "You sound really angry at him right now. Tell me what happened."',
      },
      {
        title: 'Describe, Don\'t Attack',
        summary: 'Instead of criticizing the child ("You\'re so messy!"), describe the problem ("I see a wet towel on the bed"). This invites cooperation without triggering defensiveness.',
        practical_tip: 'Replace "You never put your shoes away" with "I see shoes in the middle of the hallway." Children respond better to information than accusations.',
      },
      {
        title: 'Give Information Instead of Orders',
        summary: 'Children cooperate more readily when given information rather than commands. "Milk turns sour when left out" works better than "Put the milk away!"',
        practical_tip: 'Try "The dog hasn\'t been fed yet" instead of "Feed the dog right now!" Information respects intelligence and invites initiative.',
      },
      {
        title: 'Offer Choices',
        summary: 'When children must do something, offering a choice within limits preserves their sense of autonomy and reduces resistance.',
        practical_tip: '"Do you want to put on your pajamas before or after brushing your teeth?" Both paths lead to bedtime, but the child feels in control.',
      },
      {
        title: 'Praise the Process, Not the Person',
        summary: 'Instead of evaluating ("Good boy!"), describe what you see ("You put every block back in the box — even the tiny ones!"). Descriptive praise builds intrinsic motivation.',
        practical_tip: 'Replace "Great job on your drawing!" with "I notice you used three different shades of blue for the sky — that gives it real depth."',
      },
      {
        title: 'Problem-Solve Together',
        summary: 'Instead of imposing solutions, invite children to brainstorm solutions with you. Even young children can contribute ideas, and they\'re more invested in solutions they helped create.',
        practical_tip: 'When siblings fight over a toy: "We have a problem — two kids and one toy. What ideas do you have for solving this?"',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Start with acknowledging feelings through tone and reflection: "Ouch, that hurt!" The communication patterns begin now, even before full language.' },
      { age_range: '3-5', applicable: true, takeaway: 'The sweet spot for this book. Choices, describing problems, and acknowledging feelings are incredibly powerful with toddlers and preschoolers.' },
      { age_range: '6-9', applicable: true, takeaway: 'Children can participate fully in problem-solving sessions. Descriptive praise becomes especially important as school introduces evaluative pressure.' },
      { age_range: '10-12', applicable: true, takeaway: 'The autonomy-building techniques become critical. Pre-teens need more choices and more collaborative problem-solving, less top-down direction.' },
      { age_range: '13+', applicable: false, takeaway: 'For teens, the companion book "How to Talk So Teens Will Listen" adapts these principles for adolescent-specific challenges.' },
    ],
    activities: [
      {
        name: 'Feelings Vocabulary Poster',
        age_range: '3-8',
        description: 'Create a poster of faces showing different emotions (happy, sad, angry, frustrated, worried, excited, jealous, proud, etc.). When your child is having a big feeling, point to the poster: "Which face matches how you feel right now?"',
        materials: 'Poster board, markers or printed emotion faces',
        time_needed: '30 minutes to create',
      },
      {
        name: 'Family Problem-Solving Meeting',
        age_range: '5-12',
        description: 'Hold a weekly 15-minute family meeting. Each person raises one problem. Everyone brainstorms solutions (all ideas written, none criticized). Family votes on which to try for a week.',
        materials: 'Paper for writing ideas',
        time_needed: '15 minutes weekly',
      },
      {
        name: 'The Description Challenge',
        age_range: 'Parents',
        description: 'For one day, replace all commands with descriptions. Instead of "Clean your room!" try "I notice clothes on the floor and an unmade bed." Track how your children respond differently.',
        time_needed: 'One full day',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents who feel stuck in power struggles',
        'Anyone who finds themselves yelling or nagging',
        'Parents of children ages 2-12 (prime range)',
        'Those who learn best from concrete examples and scripts',
      ],
      not_ideal_for: [
        'Parents of exclusively teens (get the teen version instead)',
        'Those looking for deep theory (this is purely practical)',
      ],
      reading_time: '4-5 hours',
      difficulty: 'easy',
      one_line: 'The most practical communication toolkit any parent can own.',
    },
    related_approaches: ['rie', 'positive-discipline'],
    related_topics: ['communication', 'cooperation', 'sibling-rivalry', 'discipline-strategies'],
  },

  {
    book_slug: 'the-self-driven-child',
    overview: 'Stixrud and Johnson argue that the most important thing parents can do is give their children a sense of control over their own lives. Drawing on neuroscience and clinical experience, they show that a healthy sense of control reduces stress, builds motivation, and is the key to mental health. The core insight: instead of being your child\'s manager, become their consultant.',
    key_concepts: [
      {
        title: 'Be a Consultant, Not a Manager',
        summary: 'Managers make decisions for others; consultants offer information and let others decide. Shifting from manager to consultant reduces conflict and builds your child\'s decision-making muscles.',
        practical_tip: '"I\'ve noticed you\'re stressed about the test. Would you like to hear some ideas for studying, or would you prefer to figure out your own plan?"',
      },
      {
        title: 'The Sense of Control',
        summary: 'A sense of control is the single most important factor in human stress management. Children who feel they have some control over their lives are less anxious, more motivated, and more resilient.',
        practical_tip: 'Look for every opportunity to give your child agency: what to wear, what to eat for snack, how to organize homework, when to practice piano.',
      },
      {
        title: 'Whose Homework Is It?',
        summary: 'When parents own their child\'s responsibilities, children lose motivation and initiative. Homework, grades, and college are the child\'s job — not yours.',
        practical_tip: 'Tell your child: "I\'m here to help if you need me, but your schoolwork is your responsibility. I trust you to handle it."',
      },
      {
        title: 'Sleep Is Non-Negotiable',
        summary: 'Sleep deprivation is the most common cause of attention problems, emotional dysregulation, and poor academic performance in children. It masquerades as ADHD, anxiety, and defiance.',
        practical_tip: 'Protect sleep above all else. A well-rested child with B\'s is healthier than a sleep-deprived child with A\'s.',
      },
      {
        title: 'The Brain-Body Connection to Stress',
        summary: 'Chronic stress damages the developing brain. The fight-or-flight system, designed for physical threats, is constantly activated by modern pressures like overscheduling and academic pressure.',
        practical_tip: 'Audit your family schedule. If your child has no unstructured downtime on most days, something needs to go.',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: false, takeaway: 'The concepts are more relevant as children develop autonomy, but you can start by following infant cues and offering simple choices.' },
      { age_range: '3-5', applicable: true, takeaway: 'Offer simple choices throughout the day. Let preschoolers experience natural consequences of their decisions in low-stakes situations.' },
      { age_range: '6-9', applicable: true, takeaway: 'Begin transitioning from managing homework and routines to consulting. Let children experience the consequences of forgetting their lunch.' },
      { age_range: '10-12', applicable: true, takeaway: 'This is the critical transition period. Start giving children ownership of academic work, social decisions, and time management.' },
      { age_range: '13+', applicable: true, takeaway: 'Peak relevance. Teens need to make real decisions, experience real consequences, and know you trust them to navigate their own lives.' },
    ],
    activities: [
      {
        name: 'The Choice Audit',
        age_range: 'Parents',
        description: 'For one day, count how many decisions you make FOR your child versus WITH or BY your child. Then identify 3 areas where you could hand over more control.',
        time_needed: '1 day observation + 15 min reflection',
      },
      {
        name: 'The Consultant Conversation',
        age_range: '8-18',
        description: 'When your child faces a decision, practice the consultant script: "Would you like my thoughts on this, or do you want to work it out yourself?" If they want input, share information and options — not directives.',
        time_needed: 'Ongoing practice',
      },
      {
        name: 'Schedule Detox',
        age_range: '6-18',
        description: 'Review the family calendar. Ensure every child has at least 1 hour of completely unstructured time every day. If not, identify what can be reduced or eliminated.',
        materials: 'Family calendar',
        time_needed: '30 minutes',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents of school-age children and teens feeling overwhelmed by academic pressure',
        'Helicopter or "snowplow" parents who want to step back but don\'t know how',
        'Families dealing with homework battles or unmotivated kids',
        'Parents concerned about rising anxiety and depression in youth',
      ],
      not_ideal_for: [
        'Parents of very young children (under 3) — the concepts apply more later',
        'Those looking for discipline strategies (this is about autonomy, not behavior management)',
      ],
      reading_time: '6-7 hours',
      difficulty: 'moderate',
      one_line: 'Stop managing your child\'s life — start consulting.',
    },
    related_approaches: ['democratic-free', 'unschooling', 'self-directed-learning'],
    related_topics: ['motivation', 'stress-anxiety', 'homework', 'autonomy', 'overscheduling'],
  },

  {
    book_slug: 'raising-an-emotionally-intelligent-child',
    overview: 'Based on decades of research, Gottman identifies five "Emotion Coaching" steps that help children understand and regulate their feelings. His research shows that children whose parents practice emotion coaching have better academic performance, stronger friendships, fewer behavior problems, and even better physical health. The key insight: emotions are opportunities for connection and teaching, not problems to solve.',
    key_concepts: [
      {
        title: 'The Five Steps of Emotion Coaching',
        summary: '1) Be aware of the child\'s emotion, 2) Recognize the emotion as an opportunity for intimacy and teaching, 3) Listen empathically, 4) Help the child label the emotion, 5) Set limits while problem-solving.',
        practical_tip: 'When your child is angry about losing a game: "I can see you\'re really frustrated (label). Losing is hard (validate). What could we do about it? Throwing the pieces isn\'t okay, but we could talk about what happened (limits + problem-solve)."',
      },
      {
        title: 'Four Parenting Styles with Emotions',
        summary: 'Dismissing parents minimize emotions. Disapproving parents criticize emotions. Laissez-faire parents accept all emotions but don\'t set limits. Emotion Coaching parents accept emotions AND guide behavior.',
        practical_tip: 'Notice your default style. Do you say "You\'re fine!" (dismissing), "Stop crying!" (disapproving), or "I understand you\'re upset AND hitting isn\'t okay" (coaching)?',
      },
      {
        title: 'All Feelings Are Acceptable, Not All Behaviors',
        summary: 'The crucial distinction: every emotion is valid and deserves acknowledgment, but behavior still has limits. You can be furious — you cannot hit.',
        practical_tip: '"It\'s okay to feel angry at your sister. It\'s NOT okay to call her names. Let\'s figure out a way to tell her how you feel."',
      },
      {
        title: 'Emotional Awareness Starts with You',
        summary: 'You can\'t coach your child through emotions you haven\'t come to terms with yourself. Your own emotional awareness is the foundation.',
        practical_tip: 'Notice and name your own emotions throughout the day. "I\'m feeling stressed right now." Model emotional vocabulary for your children.',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Begin narrating emotions: "You\'re frustrated because you can\'t reach the toy." Babies absorb emotional vocabulary long before they can use it.' },
      { age_range: '3-5', applicable: true, takeaway: 'The prime window for emotion coaching. Preschoolers have big emotions and are hungry for language to describe their inner world.' },
      { age_range: '6-9', applicable: true, takeaway: 'Children can now participate more actively in the problem-solving step. Help them generate their own solutions to emotional challenges.' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens face complex social emotions (jealousy, embarrassment, exclusion). Emotion coaching helps them navigate the increasingly complex social world.' },
      { age_range: '13+', applicable: true, takeaway: 'Teens may not want to talk, but knowing you\'re a safe landing pad for emotions is crucial. Keep coaching available without forcing conversations.' },
    ],
    activities: [
      {
        name: 'Emotion Coaching Practice Cards',
        age_range: 'Parents',
        description: 'Create cards with common scenarios (child loses at a game, friend is mean, sibling takes toy). Practice the 5 steps of emotion coaching with each scenario. Rehearsing makes it easier in real moments.',
        materials: 'Index cards',
        time_needed: '20 minutes',
      },
      {
        name: 'Feelings Check-In at Dinner',
        age_range: '3-12',
        description: 'Each family member shares their "high" and "low" of the day and names the emotion that went with it. This normalizes emotional awareness and creates connection.',
        time_needed: '10 minutes at dinner',
      },
      {
        name: 'The Emotion Scientist',
        age_range: '5-10',
        description: 'After a strong emotion passes, explore it together like scientists: "Where did you feel that anger in your body? What did it look like? What color would it be? How big was it? What made it smaller?"',
        time_needed: '10 minutes',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents who grew up in households where emotions were dismissed or punished',
        'Anyone struggling with their child\'s big emotions or emotional outbursts',
        'Parents who want research-backed emotional development strategies',
        'Those who want to build their child\'s emotional intelligence from the ground up',
      ],
      not_ideal_for: [
        'Parents looking for quick behavioral fixes (emotional intelligence is a long game)',
        'Those already well-versed in emotion coaching (this is foundational-level)',
      ],
      reading_time: '5-6 hours',
      difficulty: 'easy',
      one_line: 'The research-backed blueprint for raising emotionally intelligent children.',
    },
    related_approaches: ['rie', 'waldorf-steiner'],
    related_topics: ['emotional-regulation', 'empathy', 'social-skills', 'tantrums-meltdowns'],
  },

  {
    book_slug: 'permission-to-feel',
    overview: 'Marc Brackett, director of the Yale Center for Emotional Intelligence, introduces the RULER framework — a systematic approach to developing emotional intelligence. He reveals how emotions drive learning, decision-making, relationships, and health, yet most of us were never taught to understand or manage them. The book applies to both children and the adults who care for them.',
    key_concepts: [
      {
        title: 'RULER: A Framework for Emotional Intelligence',
        summary: 'Recognize emotions in yourself and others. Understand causes and consequences. Label emotions with precise vocabulary. Express emotions appropriately. Regulate emotions effectively.',
        practical_tip: 'Start with R — just noticing. "What am I feeling right now?" before reacting. Build each RULER skill one at a time.',
      },
      {
        title: 'The Mood Meter',
        summary: 'A simple 2x2 grid mapping emotions by energy (high/low) and pleasantness (positive/negative). Red = high energy negative (angry), Yellow = high energy positive (excited), Blue = low energy negative (sad), Green = low energy positive (calm).',
        practical_tip: 'Put a mood meter on the fridge. Check in with family members: "Where are you on the mood meter right now?" This builds awareness without judgment.',
      },
      {
        title: 'Emotion Granularity',
        summary: 'People with richer emotion vocabularies regulate their emotions better. "I\'m fine" vs. "I\'m feeling overwhelmed, a bit resentful, and exhausted" — the second person can actually address what\'s wrong.',
        practical_tip: 'Expand beyond happy/sad/angry/scared. Introduce words like frustrated, disappointed, anxious, nostalgic, awed, content, hopeful, embarrassed.',
      },
      {
        title: 'The Meta-Moment',
        summary: 'The space between a trigger and your response. In that moment, you can choose to react from your "worst self" or respond from your "best self."',
        practical_tip: 'When triggered, breathe and ask: "How would my best self handle this?" Visualize your best self responding. Then act from that place.',
      },
      {
        title: 'Emotions Are Data, Not Directives',
        summary: 'Emotions provide information about our inner state and environment. They aren\'t commands to obey. Feeling angry doesn\'t mean you must act aggressively.',
        practical_tip: 'Teach children: "Your anger is telling you something — that something feels unfair. Let\'s listen to what it\'s saying without letting it drive."',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Model emotional labeling: "Mama is feeling frustrated right now." Babies learn emotional patterns by watching you.' },
      { age_range: '3-5', applicable: true, takeaway: 'Introduce the Mood Meter with simple colors. Help children move from "I feel bad" to more specific words like "scared" or "lonely."' },
      { age_range: '6-9', applicable: true, takeaway: 'Children can learn the full RULER framework. Practice the Meta-Moment before reactions: "What would your best self do right now?"' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens can understand emotions as data. Help them analyze: "What is this feeling telling you about what you need?"' },
      { age_range: '13+', applicable: true, takeaway: 'Teens face the most emotionally complex situations. The Meta-Moment becomes critical for navigating peer pressure, social media, and identity.' },
    ],
    activities: [
      {
        name: 'Family Mood Meter',
        age_range: '4-18',
        description: 'Print or draw a Mood Meter and post it where everyone can see. Each family member moves their magnet/sticker to where they are at least once daily. No judgment — just awareness.',
        materials: 'Printed mood meter, magnets or stickers',
        time_needed: '2 minutes daily',
      },
      {
        name: 'Emotion Vocabulary Builder',
        age_range: '5-12',
        description: 'Each week, introduce one new emotion word (e.g., "nostalgic," "overwhelmed," "serene"). Use it in context throughout the week. By month\'s end, the family has four new words.',
        time_needed: '5 minutes introduction + ongoing use',
      },
      {
        name: 'Best Self Visualization',
        age_range: '7-18',
        description: 'Have each family member draw or describe their "best self" — how they act, speak, and treat others when at their best. Keep it visible. When emotions run high, reference it: "What would your best self do?"',
        materials: 'Paper, markers',
        time_needed: '20 minutes',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents wanting a systematic framework (not just tips) for emotional intelligence',
        'Educators and parents who want to model emotional skills',
        'Families where emotions are either suppressed or chaotic',
        'Adults who recognize they need to develop their own emotional intelligence first',
      ],
      not_ideal_for: [
        'Those who prefer narrative/story-based books (this is more framework-oriented)',
        'Parents looking only for child-focused strategies (this starts with the adult)',
      ],
      reading_time: '5-6 hours',
      difficulty: 'moderate',
      one_line: 'A systematic framework for emotional intelligence — for you first, then your kids.',
    },
    related_approaches: ['social-emotional-learning'],
    related_topics: ['emotional-regulation', 'emotional-intelligence', 'mindfulness', 'self-awareness'],
  },

  {
    book_slug: 'the-explosive-child',
    overview: 'Greene fundamentally reframes challenging behavior: kids do well if they can. When children are chronically inflexible, easily frustrated, or explosively angry, it\'s not because they won\'t behave — it\'s because they lack the skills to behave. The book introduces Collaborative & Proactive Solutions (CPS), a method for identifying lagging skills and solving problems collaboratively rather than through rewards and punishments.',
    key_concepts: [
      {
        title: 'Kids Do Well If They Can',
        summary: 'The foundational philosophy: challenging behavior is the result of lagging skills (flexibility, frustration tolerance, problem-solving), not bad character or lack of motivation.',
        practical_tip: 'When your child "won\'t" do something, reframe to "can\'t" — at least not yet, not in this moment. What skill is lagging?',
      },
      {
        title: 'Three Plans: A, B, and C',
        summary: 'Plan A: impose your will (triggers explosions). Plan C: drop the expectation for now (strategic, not giving in). Plan B: solve the problem collaboratively (the sweet spot).',
        practical_tip: 'Before any interaction with a challenging child, decide: Is this a Plan A (safety issue), Plan C (not worth the battle today), or Plan B (let\'s solve this together)?',
      },
      {
        title: 'The Plan B Process',
        summary: 'Step 1: Empathy — gather information about the child\'s concern. Step 2: Define the adult concern. Step 3: Invitation — brainstorm solutions that address both concerns.',
        practical_tip: '"I\'ve noticed that getting dressed in the morning is really hard. What\'s going on with that?" Listen first. Then: "The thing is, we need to leave by 7:30. Let\'s figure out something that works for both of us."',
      },
      {
        title: 'Lagging Skills Inventory',
        summary: 'A checklist of cognitive skills that, when lagging, produce challenging behavior: flexibility, frustration tolerance, problem-solving, emotional regulation, communication, attention shifting.',
        practical_tip: 'Review the lagging skills checklist for your child. Identify the top 2-3 lagging skills. Focus on building those skills, not punishing the behaviors they produce.',
      },
      {
        title: 'Proactive, Not Reactive',
        summary: 'The best time to solve problems is when everyone is calm, not during a crisis. Proactive Plan B conversations happen outside of heated moments.',
        practical_tip: 'Identify your child\'s most predictable challenging moments. Initiate a calm Plan B conversation about each one before the next occurrence.',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: false, takeaway: 'Too young for formal CPS, but the "kids do well if they can" philosophy applies from birth — expect age-appropriate behavior, not more.' },
      { age_range: '3-5', applicable: true, takeaway: 'Simplified Plan B works: "You don\'t want to leave the park. You\'re having fun. AND we need to go home for dinner. What could help?"' },
      { age_range: '6-9', applicable: true, takeaway: 'Prime age for full CPS. Children can articulate their concerns and brainstorm solutions. Many explosive behaviors are solved through collaborative problem-solving.' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens can become active partners in identifying their own lagging skills and developing strategies to build them.' },
      { age_range: '13+', applicable: true, takeaway: 'CPS respects teen autonomy while maintaining parental concerns. It\'s especially effective because teens reject authoritarian approaches.' },
    ],
    activities: [
      {
        name: 'Lagging Skills Assessment',
        age_range: 'Parents',
        description: 'Download the ALSUP (Assessment of Lagging Skills and Unsolved Problems) from livesinthebalance.org. Go through it for your child. Identify the top 3 lagging skills and the top 3 unsolved problems.',
        time_needed: '30-45 minutes',
      },
      {
        name: 'Proactive Plan B Session',
        age_range: '5-18',
        description: 'Choose ONE unsolved problem. During a calm moment, initiate: "I\'ve noticed that [X] has been hard. What\'s up with that?" Listen. Share your concern. Brainstorm together. Write down the agreed solution and try it for a week.',
        time_needed: '15-20 minutes',
      },
      {
        name: 'Plan C Triage',
        age_range: 'Parents',
        description: 'List all the expectations you have for your child. Divide them into three columns: Plan A (non-negotiable safety issues), Plan B (important, solve collaboratively), Plan C (drop for now). Most parents are surprised how much goes into Plan C.',
        materials: 'Paper with three columns',
        time_needed: '20 minutes',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents of children with frequent meltdowns, explosions, or inflexibility',
        'Families where traditional discipline (rewards/consequences) isn\'t working',
        'Parents of children with ADHD, autism, anxiety, or other conditions that affect flexibility',
        'Anyone exhausted from constant power struggles',
      ],
      not_ideal_for: [
        'Parents whose children are generally cooperative (this is for persistent challenges)',
        'Those seeking a quick fix (CPS is a skill that takes practice)',
      ],
      reading_time: '5-6 hours',
      difficulty: 'moderate',
      one_line: 'If rewards and consequences aren\'t working, this book explains why — and what to do instead.',
    },
    related_approaches: ['positive-discipline'],
    related_topics: ['challenging-behavior', 'emotional-regulation', 'adhd', 'flexibility', 'problem-solving'],
  },

  {
    book_slug: 'raising-a-secure-child',
    overview: 'Based on the Circle of Security intervention used by thousands of families worldwide, this book helps parents understand attachment through a beautifully simple visual: a circle where the child ventures out to explore (top) and returns for comfort (bottom). The parent\'s job is to be a secure base for exploration AND a safe haven for comfort. Most attachment problems come from struggling with one side of the circle.',
    key_concepts: [
      {
        title: 'The Circle of Security',
        summary: 'Children alternate between two needs: the need to explore the world (top of circle) and the need to return for comfort and connection (bottom of circle). Secure attachment means supporting both.',
        practical_tip: 'Watch your child. Are they heading out to explore? Support with encouragement. Coming back for comfort? Welcome them with warmth. Match your response to their need.',
      },
      {
        title: 'Being Bigger, Stronger, Wiser, and Kind',
        summary: 'Children need parents who are bigger (able to handle what the child can\'t), stronger (not falling apart), wiser (understanding development), and kind (not harsh or punitive).',
        practical_tip: 'When your child is distressed, ask yourself: "Am I being big enough to contain this? Strong enough to stay calm? Wise enough to know what they need? Kind enough to deliver it warmly?"',
      },
      {
        title: 'Shark Music',
        summary: 'The term for the anxiety, fear, or discomfort parents feel when their child has certain needs. Your "shark music" often plays loudest around the parts of the circle that your own parents struggled with.',
        practical_tip: 'Notice when your child\'s behavior triggers anxiety in you. That\'s "shark music" — information about your own attachment history, not about your child\'s behavior.',
      },
      {
        title: 'Miscues — What Kids Do When Needs Aren\'t Met',
        summary: 'When children don\'t get what they need, they develop "miscues" — indirect ways of getting needs met. An overly independent child may actually be hiding their need for comfort.',
        practical_tip: 'Look beyond the surface behavior. A child who "never needs you" might actually need comfort the most. A clingy child might need help feeling safe to explore.',
      },
      {
        title: 'Good Enough Parenting',
        summary: 'You don\'t need to be perfect. Research shows that parents need to "get it right" only about 30% of the time. What matters more is the ability to repair when you miss.',
        practical_tip: 'Let go of perfection. Focus on repair: "I missed what you needed earlier. I\'m here now."',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'The most critical period for attachment. Respond to your baby\'s signals — both their need to explore and their need to return for comfort. You cannot spoil a baby by responding.' },
      { age_range: '3-5', applicable: true, takeaway: 'The circle becomes more visible. You\'ll see your child venture further (playground, preschool) and return for emotional refueling. Support both movements.' },
      { age_range: '6-9', applicable: true, takeaway: 'The circle expands to school and friendships. Children still need a secure base at home to explore the increasingly complex social world.' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens may seem to not need the bottom of the circle, but they do. Stay available for comfort even as they push toward independence.' },
      { age_range: '13+', applicable: true, takeaway: 'The circle is now very wide but still exists. Teens need to know you\'re a safe haven even as they explore identity, relationships, and independence.' },
    ],
    activities: [
      {
        name: 'Circle Observation',
        age_range: 'Parents (0-8)',
        description: 'At the playground, observe your child for 30 minutes. Notice when they go out to explore (top of circle) and when they come back for connection (bottom). Note which movement is easier for you to support.',
        time_needed: '30 minutes',
      },
      {
        name: 'Shark Music Journal',
        age_range: 'Parents',
        description: 'For a week, notice when your child\'s behavior triggers discomfort in you. Write: What did they do? What did I feel? Does this remind me of anything from my childhood? This reveals your "shark music."',
        materials: 'Journal',
        time_needed: '5 minutes daily',
      },
      {
        name: 'Draw the Circle',
        age_range: '5-10',
        description: 'Draw the Circle of Security with your child. On top, draw things they like to explore and do independently. On the bottom, draw what makes them feel safe and comforted. Discuss both sides.',
        materials: 'Paper, markers',
        time_needed: '20 minutes',
      },
    ],
    is_for_me: {
      best_for: [
        'New parents wanting to build secure attachment from the start',
        'Parents who notice their child is either overly clingy or overly independent',
        'Anyone who wants to understand attachment theory in a practical, visual way',
        'Parents aware that their own childhood affects their parenting',
      ],
      not_ideal_for: [
        'Parents looking for behavioral strategies (this is about the relationship foundation)',
        'Those already well-versed in attachment theory (this covers the basics)',
      ],
      reading_time: '5-6 hours',
      difficulty: 'moderate',
      one_line: 'The clearest, most visual guide to attachment parenting ever written.',
    },
    related_approaches: ['attachment-parenting', 'rie'],
    related_topics: ['attachment', 'bonding', 'separation-anxiety', 'secure-base'],
  },

  {
    book_slug: 'elevating-child-care',
    overview: 'Janet Lansbury translates Magda Gerber\'s RIE (Resources for Infant Educarers) approach into accessible, modern parenting wisdom. The core principle: treat your child as a capable, whole person from birth. This means respectful communication, allowing struggle, following the child\'s lead in play, and setting clear limits with empathy.',
    key_concepts: [
      {
        title: 'Respect from Day One',
        summary: 'Talk to your baby like a person, not a doll. Narrate what you\'re doing: "I\'m going to pick you up now." This builds trust, language, and the child\'s sense of being valued.',
        practical_tip: 'Before picking up your baby, make eye contact and say "I\'m going to pick you up now" — and pause. Even newborns respond to this respectful approach.',
      },
      {
        title: 'Don\'t Interrupt Play',
        summary: 'When a child is engaged in self-directed play — even just staring at their hands — they\'re learning. Resist the urge to entertain, teach, or redirect.',
        practical_tip: 'Create a safe play space and let your child explore without direction. Your job is to observe and be available, not to perform or instruct.',
      },
      {
        title: 'Allow Struggle',
        summary: 'When a child is working hard on something (reaching a toy, climbing stairs), resist the urge to help immediately. Productive struggle builds confidence, persistence, and problem-solving.',
        practical_tip: 'Instead of helping, sportcast: "You\'re working hard to reach that ball. You\'re stretching your arm... almost there." Help only when frustration becomes overwhelming.',
      },
      {
        title: 'Clear Limits with Empathy',
        summary: 'Children need boundaries to feel safe. Set them calmly and firmly while acknowledging the child\'s feelings: "I won\'t let you hit. You\'re angry, and I understand."',
        practical_tip: 'Use "I won\'t let you" instead of "Don\'t." It conveys that you\'re the one keeping things safe, without making the child feel bad.',
      },
      {
        title: 'Slow Down Caregiving Moments',
        summary: 'Diapering, feeding, and bathing aren\'t chores to rush through — they\'re opportunities for one-on-one connection. Slow down and invite the child to participate.',
        practical_tip: 'During diaper changes, narrate: "I\'m going to take off the wet diaper now. Can you lift your legs?" Make it a cooperative interaction, not something done to them.',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'The core audience for this book. Every concept applies directly: respectful care, uninterrupted play, narrating interactions, allowing struggle.' },
      { age_range: '3-5', applicable: true, takeaway: 'The principles extend naturally. Preschoolers benefit enormously from being treated as capable, having limits with empathy, and having play respected.' },
      { age_range: '6-9', applicable: true, takeaway: 'The underlying philosophy — respect, capability, clear limits — continues to apply, though the specific examples are geared younger.' },
      { age_range: '10-12', applicable: false, takeaway: 'While the respect philosophy is universal, this book\'s practical examples focus on early childhood.' },
      { age_range: '13+', applicable: false, takeaway: 'The philosophy applies but the book is not written for this age group.' },
    ],
    activities: [
      {
        name: 'Observation Time',
        age_range: '0-3',
        description: 'Set a timer for 15 minutes. Place your child in a safe play area with a few simple objects. Your only job: observe. Don\'t direct, teach, or entertain. Just watch and note what your child does independently.',
        time_needed: '15 minutes',
      },
      {
        name: 'Slow Care Practice',
        age_range: '0-2',
        description: 'Choose one caregiving routine (diapering, feeding, or bathing). Slow it down by 50%. Narrate everything. Invite participation. Make eye contact. Notice how the experience changes.',
        time_needed: 'During existing routine',
      },
      {
        name: '"I Won\'t Let You" Practice',
        age_range: '1-5',
        description: 'For one week, replace all "Don\'t" statements with "I won\'t let you" followed by an acknowledgment. "I won\'t let you throw food. I know you\'re done eating — you can say \'all done.\'"',
        time_needed: 'Ongoing practice',
      },
    ],
    is_for_me: {
      best_for: [
        'New parents or parents of babies and toddlers (0-3)',
        'Parents who want to foster independence from the earliest age',
        'Anyone drawn to respectful, RIE-inspired parenting',
        'Parents who feel pressured to constantly entertain their baby',
      ],
      not_ideal_for: [
        'Parents of older children (5+) looking for age-specific advice',
        'Those looking for structured activities or curriculum for babies',
      ],
      reading_time: '3-4 hours',
      difficulty: 'easy',
      one_line: 'The book that teaches you your baby is more capable than you think.',
    },
    related_approaches: ['rie', 'montessori'],
    related_topics: ['baby-development', 'independent-play', 'respectful-parenting', 'toddler-behavior'],
  },

  {
    book_slug: 'no-drama-discipline',
    overview: 'The companion to The Whole-Brain Child, this book applies brain science specifically to discipline moments. Siegel and Bryson argue that discipline means "to teach," not "to punish." Every misbehavior is an opportunity to build your child\'s brain — literally strengthening neural connections for empathy, self-regulation, and decision-making.',
    key_concepts: [
      {
        title: 'Connect Before You Redirect',
        summary: 'When a child misbehaves, their emotional brain is activated. Before you can teach anything, you need to connect: get on their level, validate the feeling, help them calm down. Then redirect.',
        practical_tip: 'Resist the urge to immediately correct. First: "Wow, you\'re really upset." Wait for the child to feel felt. THEN: "Let\'s talk about what happened."',
      },
      {
        title: 'Why? What? How?',
        summary: 'Before responding to misbehavior, ask three questions. Why did my child act this way? What lesson do I want to teach? How can I best teach it in this moment?',
        practical_tip: 'Pause before reacting. "He hit his sister because he\'s overtired and his impulse control is low right now. I want to teach that hitting isn\'t okay AND that I understand he\'s struggling."',
      },
      {
        title: 'Building the Upstairs Brain',
        summary: 'Punitive discipline (time-outs, yelling, spanking) activates the lower brain and misses the teaching opportunity. Collaborative discipline engages and strengthens the higher brain functions.',
        practical_tip: 'After connecting, ask questions that engage thinking: "What were you trying to accomplish?" "How do you think she felt?" "What could you do differently next time?"',
      },
      {
        title: 'The Mindsight Approach',
        summary: 'Help children develop insight into their own minds — noticing their thoughts, feelings, and impulses. Children who can observe their inner experience can choose how to respond rather than just react.',
        practical_tip: '"I noticed you clenched your fists before you hit. What were you feeling right then? Next time you feel that, what could you do instead?"',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Discipline at this age is about keeping the environment safe and calmly redirecting. "I won\'t let you hit" while gently stopping the hand.' },
      { age_range: '3-5', applicable: true, takeaway: 'Connect then redirect is transformative at this age. Young children need emotional connection before they can absorb any lesson.' },
      { age_range: '6-9', applicable: true, takeaway: 'The "Why? What? How?" framework works well. Children can now reflect on their behavior and brainstorm alternatives.' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens can engage in deeper reflection about their actions. Use discipline moments to build empathy and perspective-taking skills.' },
      { age_range: '13+', applicable: true, takeaway: 'Connection before correction is even more critical with teens. They shut down fast if they feel lectured or controlled.' },
    ],
    activities: [
      {
        name: 'The 3-Question Pause',
        age_range: 'Parents',
        description: 'Tape these three questions where you can see them: 1) WHY did my child do that? 2) WHAT do I want to teach? 3) HOW can I best teach it right now? Practice pausing to ask these before responding to misbehavior.',
        time_needed: 'Ongoing practice',
      },
      {
        name: 'Redo Invitation',
        age_range: '3-10',
        description: 'Instead of punishment after misbehavior, offer a redo: "That didn\'t go well. Want to try again?" This teaches that mistakes are fixable and practice leads to improvement.',
        time_needed: '2-3 minutes per incident',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents who want to discipline without punishment',
        'Anyone who read The Whole-Brain Child and wants to go deeper on discipline',
        'Parents tired of time-outs that don\'t seem to work',
        'Those who want to understand the brain science behind behavior',
      ],
      not_ideal_for: [
        'Parents looking for a strict behavioral framework with clear consequences',
        'Those who haven\'t read The Whole-Brain Child (start there)',
      ],
      reading_time: '5-6 hours',
      difficulty: 'easy',
      one_line: 'Discipline that builds brains instead of breaking spirits.',
    },
    related_approaches: ['montessori', 'rie', 'positive-discipline'],
    related_topics: ['discipline-strategies', 'tantrums-meltdowns', 'brain-development', 'cooperation'],
  },

  {
    book_slug: 'unconditional-parenting',
    overview: 'Kohn challenges virtually everything mainstream parenting takes for granted: praise, rewards, punishments, time-outs, and even the phrase "good job." He argues that conditional parenting — where love and approval depend on behavior — produces anxious, approval-seeking children. The alternative: love that doesn\'t depend on what children do, combined with involving them in decisions about their own lives.',
    key_concepts: [
      {
        title: 'Love Without Conditions',
        summary: 'Children should feel loved regardless of their behavior, performance, or compliance. Conditional love ("I love you when you behave") creates insecurity and people-pleasing.',
        practical_tip: 'After your child misbehaves, ensure they know: "I\'m frustrated with what happened, AND I love you always. Those two things exist at the same time."',
      },
      {
        title: 'The Problem with Praise',
        summary: '"Good job!" and "You\'re so smart!" seem harmless but create dependence on external validation. Children begin performing for approval rather than intrinsic satisfaction.',
        practical_tip: 'Replace evaluative praise with interest: "Tell me about your painting" or description: "You used a lot of blue today." This invites conversation, not compliance.',
      },
      {
        title: 'The Problem with Rewards and Punishments',
        summary: 'Both rewards ("If you eat your vegetables, you get dessert") and punishments operate through the same mechanism: control. Both reduce intrinsic motivation and teach "what do I get?" thinking.',
        practical_tip: 'Instead of sticker charts, try collaborative problem-solving: "Mornings are really hard. What could we do to make them work better for all of us?"',
      },
      {
        title: 'Working WITH, Not Doing TO',
        summary: 'The fundamental shift: from controlling children\'s behavior to involving them in decisions. Children who participate in rule-making are more invested in following through.',
        practical_tip: 'When a problem arises, resist imposing a solution. "We have a problem with screen time. Let\'s sit down together and figure out a plan that works for everyone."',
      },
      {
        title: 'Long-Term Goals Over Short-Term Compliance',
        summary: 'What kind of person do you want your child to become? Focus on that vision rather than on immediate obedience. Quick compliance often undermines long-term character development.',
        practical_tip: 'When tempted to demand compliance, ask: "Am I teaching my child to think for themselves, or to obey without thinking?"',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Respond unconditionally to your baby\'s needs. This isn\'t spoiling — it\'s building the foundation of secure attachment and trust.' },
      { age_range: '3-5', applicable: true, takeaway: 'Replace sticker charts and time-outs with explanation and collaborative problem-solving. Offer choices instead of commands wherever possible.' },
      { age_range: '6-9', applicable: true, takeaway: 'Be aware of how school introduces heavy rewards/punishment systems. At home, focus on understanding and collaboration rather than compliance.' },
      { age_range: '10-12', applicable: true, takeaway: 'Pre-teens can handle genuine discussions about family rules and expectations. Involve them in creating guidelines rather than imposing them.' },
      { age_range: '13+', applicable: true, takeaway: 'Unconditional love is most tested and most needed during adolescence. Teens who know your love doesn\'t depend on performance are more resilient.' },
    ],
    activities: [
      {
        name: 'The Praise Swap',
        age_range: 'Parents',
        description: 'For one week, catch yourself every time you say "Good job!" Replace it with either a specific description ("You got all the way across the monkey bars!") or curiosity ("What was the hardest part?").',
        time_needed: 'One week practice',
      },
      {
        name: 'Family Rule-Making Session',
        age_range: '5-18',
        description: 'Instead of parents setting rules, hold a family meeting where everyone — including children — proposes and discusses family guidelines. When children help create rules, they\'re more invested.',
        time_needed: '30-45 minutes',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents willing to question mainstream parenting assumptions',
        'Anyone noticing their child is becoming approval-dependent or anxious about performance',
        'Parents who sense that rewards and punishments aren\'t building the character they want',
        'Those interested in research-backed alternatives to traditional discipline',
      ],
      not_ideal_for: [
        'Parents looking for a structured discipline system (this deconstructs rather than prescribes)',
        'Those who aren\'t ready to rethink praise and rewards',
      ],
      reading_time: '6-7 hours',
      difficulty: 'moderate',
      one_line: 'The most challenging parenting book you\'ll ever read — in the best way.',
    },
    related_approaches: ['democratic-free', 'unschooling', 'self-directed-learning'],
    related_topics: ['motivation', 'discipline-strategies', 'praise', 'autonomy', 'self-esteem'],
  },

  {
    book_slug: 'the-montessori-toddler',
    overview: 'Simone Davies brings Montessori home in a warm, beautifully designed guide for parents of children ages 0-3. The book covers setting up the home environment, daily routines, handling tantrums, fostering independence, and understanding toddler behavior through the Montessori lens. It\'s practical, gentle, and packed with specific ideas parents can implement immediately.',
    key_concepts: [
      {
        title: 'The Prepared Environment',
        summary: 'The physical space matters enormously. A Montessori home is child-accessible: low shelves with a few carefully chosen activities, child-sized furniture, and a "yes" space where the child can explore freely.',
        practical_tip: 'Get on your toddler\'s level — literally. Sit on the floor and look around. Can they reach what they need? Can they see out windows? Make at least one shelf child-accessible with 4-6 rotating activities.',
      },
      {
        title: 'Follow the Child',
        summary: 'Observe what your child is drawn to and support those interests rather than imposing your agenda. A child repeatedly opening and closing things is working on fine motor skills — support that.',
        practical_tip: 'Spend 10 minutes simply watching your child play without intervening. Note what captures their attention. Then provide more opportunities for that kind of exploration.',
      },
      {
        title: 'Practical Life Activities',
        summary: 'Toddlers want to do real work — sweeping, cooking, folding, pouring. These activities build concentration, coordination, independence, and self-esteem better than any toy.',
        practical_tip: 'Include your toddler in real household tasks. Give them a small pitcher to pour their own water, a child-safe knife to cut soft foods, a small broom to sweep alongside you.',
      },
      {
        title: 'Observation as a Superpower',
        summary: 'Instead of assuming what your child needs, watch. Observation reveals developmental stages, interests, frustrations, and capabilities that you\'d miss if you were always directing.',
        practical_tip: 'Start a simple observation journal. Weekly, note: What is my child practicing? What are they interested in? Where do they get frustrated? This guides your environment setup.',
      },
      {
        title: 'Less Is More',
        summary: 'Fewer toys, rotated regularly, lead to deeper engagement. A room full of toys is overwhelming; a shelf with a few well-chosen activities is inviting.',
        practical_tip: 'Put away 75% of your child\'s toys. Display 4-6 activities on a low shelf. When interest wanes, rotate. Notice the increase in concentration and independent play.',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'This is the core audience. Set up a "yes" space, involve your baby in caregiving routines, provide simple sensory materials, and trust their natural development.' },
      { age_range: '3-5', applicable: true, takeaway: 'The principles extend beautifully. Add more complex practical life activities, introduce art materials, and expand the prepared environment to support growing independence.' },
      { age_range: '6-9', applicable: false, takeaway: 'While Montessori principles continue, this book\'s specific guidance is for the 0-3 age range.' },
      { age_range: '10-12', applicable: false, takeaway: 'Not directly applicable, though the philosophy of respect, independence, and following interests remains relevant.' },
      { age_range: '13+', applicable: false, takeaway: 'Not applicable for this age group.' },
    ],
    activities: [
      {
        name: 'Toddler Kitchen Setup',
        age_range: '1-3',
        description: 'Create a low shelf or drawer in the kitchen with toddler-sized tools: a small pitcher, a fruit bowl they can access, a few snacks in containers they can open, a small cloth for wiping. Let them serve themselves.',
        materials: 'Small pitcher, child-safe dishes, accessible storage',
        time_needed: '30 minutes to set up',
      },
      {
        name: 'Activity Shelf Rotation',
        age_range: '1-3',
        description: 'Set up a low shelf with 4-6 activities (a puzzle, a stacking toy, a pouring activity, a simple art tray). Rotate every 1-2 weeks based on observation. Keep it uncluttered and inviting.',
        materials: 'Low shelf, 4-6 age-appropriate activities',
        time_needed: '20 minutes to rotate',
      },
      {
        name: 'Real Tools, Real Work',
        age_range: '18 months-3',
        description: 'Let your toddler participate in real household tasks: watering plants with a small watering can, washing vegetables, sweeping with a child-sized broom, sorting laundry by color.',
        materials: 'Child-sized versions of household tools',
        time_needed: 'Integrated into daily life',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents of babies and toddlers (0-3) curious about Montessori at home',
        'Anyone overwhelmed by the toy industry wanting a simpler approach',
        'Parents who want to foster independence and concentration from an early age',
        'First-time parents looking for a respectful, research-based approach',
      ],
      not_ideal_for: [
        'Parents of children older than 4 (see Montessori books for older ages)',
        'Those looking for academic Montessori theory (this is purely practical)',
      ],
      reading_time: '4-5 hours',
      difficulty: 'easy',
      one_line: 'The most beautiful, practical guide to Montessori at home for babies and toddlers.',
    },
    related_approaches: ['montessori'],
    related_topics: ['baby-development', 'toddler-behavior', 'independent-play', 'home-environment'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // MINDSET, GRIT & LEARNING
  // ══════════════════════════════════════════════════════════════════════
  {
    book_slug: 'mindset',
    overview: 'Dweck\'s research reveals two fundamental mindsets: the fixed mindset (believing intelligence and talent are static) and the growth mindset (believing abilities develop through effort, strategy, and learning). This single belief shapes how children approach challenges, handle setbacks, and ultimately how much they achieve. The book shows how parents and educators can cultivate growth mindset in children.',
    key_concepts: [
      {
        title: 'Fixed vs. Growth Mindset',
        summary: 'Fixed mindset: "I\'m smart" or "I\'m not a math person." Growth mindset: "I can\'t do this YET" and "Mistakes help me learn." The mindset determines how children respond to difficulty.',
        practical_tip: 'Add "yet" to your child\'s self-limiting statements. "I can\'t ride a bike" becomes "You can\'t ride a bike yet."',
      },
      {
        title: 'The Danger of "You\'re So Smart"',
        summary: 'Praising intelligence creates a fixed mindset. Children praised for being smart avoid challenges (might look dumb), cheat more, and give up faster when things get hard.',
        practical_tip: 'Praise the process, not the person: "You worked really hard on that" or "I like the strategy you used" instead of "You\'re so smart."',
      },
      {
        title: 'Embrace the Struggle',
        summary: 'In a growth mindset, struggle isn\'t a sign of failure — it\'s a sign of learning. The brain literally grows new connections when working on challenging problems.',
        practical_tip: 'When your child is struggling, say: "This is your brain growing! Whenever something is hard, you\'re building new connections in your brain."',
      },
      {
        title: 'Effort + Strategy + Help',
        summary: 'Growth mindset isn\'t just about effort. It\'s about trying different strategies when stuck and asking for help when needed. "Try harder" isn\'t useful; "try differently" is.',
        practical_tip: 'When your child is stuck: "What strategy are you using? What else could you try? Would it help to look at how someone else approached it?"',
      },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Start with process praise from birth: "You kept trying to reach that toy!" The neural patterns for mindset begin forming through how you respond to their efforts.' },
      { age_range: '3-5', applicable: true, takeaway: 'Introduce "yet": "You can\'t tie your shoes yet." Celebrate effort and persistence over results. Read books about characters who persevere.' },
      { age_range: '6-9', applicable: true, takeaway: 'Children can understand the brain-science: "Your brain is like a muscle — it gets stronger when you work hard." Normalize mistakes as learning.' },
      { age_range: '10-12', applicable: true, takeaway: 'Critical age as academic pressure increases. Help children see grades as feedback, not identity. Focus on learning goals over performance goals.' },
      { age_range: '13+', applicable: true, takeaway: 'Teens face identity-defining moments. Growth mindset helps them approach college prep, social challenges, and identity with resilience.' },
    ],
    activities: [
      {
        name: 'Famous Failures Wall',
        age_range: '6-12',
        description: 'Create a wall or poster of famous people who failed before succeeding: Einstein failed an entrance exam, J.K. Rowling was rejected 12 times, Michael Jordan was cut from his high school team. Add to it over time.',
        materials: 'Poster, printed stories/images',
        time_needed: '30 minutes to start, ongoing',
      },
      {
        name: 'Growth Mindset Dinner Check-In',
        age_range: '5-18',
        description: 'At dinner, each person shares: "What mistake did you make today that taught you something?" or "What was hard today and how did you handle it?" This normalizes struggle.',
        time_needed: '10 minutes at dinner',
      },
      {
        name: 'The Praise Audit',
        age_range: 'Parents',
        description: 'For one day, write down every piece of praise you give your child. Categorize each as "person praise" (You\'re smart!) or "process praise" (You worked hard on that!). Aim to shift the ratio toward process.',
        time_needed: '1 day observation',
      },
    ],
    is_for_me: {
      best_for: [
        'Parents of children who give up easily or avoid challenges',
        'Families where "being smart" is highly valued',
        'Anyone who wants to understand the science of motivation and achievement',
        'Parents and educators who want one concept that transforms learning',
      ],
      not_ideal_for: [
        'Those already familiar with growth mindset research (this is the foundational text)',
        'Parents looking for specific parenting strategies (this is more concept than toolkit)',
      ],
      reading_time: '6-7 hours',
      difficulty: 'easy',
      one_line: 'One simple idea that transforms how children approach learning, challenges, and life.',
    },
    related_approaches: ['growth-mindset-education'],
    related_topics: ['motivation', 'resilience', 'praise', 'academic-achievement', 'self-esteem'],
  },

  // Remaining books get stub content that can be expanded
  // The following entries provide essential content for all remaining books

  {
    book_slug: 'grit',
    overview: 'Angela Duckworth\'s research demonstrates that passion and perseverance — "grit" — predict success more reliably than talent or IQ. Through studies of West Point cadets, spelling bee champions, and top professionals, she shows that sustained effort in a consistent direction over years is what produces excellence. For parents, the message is clear: help children develop sustained interests and the ability to persist through difficulty.',
    key_concepts: [
      { title: 'Grit = Passion + Perseverance', summary: 'Talent gets you started, but grit gets you to the finish line. Gritty people maintain effort and interest over years despite setbacks, plateaus, and boredom.', practical_tip: 'Help your child find something they\'re genuinely interested in, then support them through the inevitable hard parts rather than letting them quit at the first sign of difficulty.' },
      { title: 'The Hard Thing Rule', summary: 'Everyone in the family does one hard thing that requires daily deliberate practice. You can quit — but only at a natural stopping point, not in the middle of frustration.', practical_tip: 'Implement the Hard Thing Rule at home. Each family member picks one challenging pursuit. You can\'t quit mid-season or mid-semester.' },
      { title: 'Interest → Practice → Purpose → Hope', summary: 'Grit develops in stages: first comes interest (finding something engaging), then practice (deliberate effort), then purpose (connecting to something larger), then hope (the belief you can improve).', practical_tip: 'Don\'t force early specialization. Let children sample widely to discover genuine interest, then support deepening commitment.' },
      { title: 'Deliberate Practice vs. Just Showing Up', summary: 'It\'s not about putting in hours — it\'s about putting in focused, targeted practice on specific weaknesses. Quality of effort matters more than quantity.', practical_tip: 'Help your child identify one specific thing to improve each practice session rather than just repeating what they\'re already good at.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: false, takeaway: 'Too young for grit concepts directly, but you can model persistence in your own activities.' },
      { age_range: '3-5', applicable: true, takeaway: 'Celebrate effort and persistence: "You kept trying even when it was hard!" Begin with short-duration commitments.' },
      { age_range: '6-9', applicable: true, takeaway: 'Introduce the Hard Thing Rule in a gentle way. Help children push through the "this is hard" phase in activities they chose.' },
      { age_range: '10-12', applicable: true, takeaway: 'Children can understand the stages of grit development. Help them connect their practice to purpose — why does this matter to them?' },
      { age_range: '13+', applicable: true, takeaway: 'Teens can fully engage with grit concepts. Support them in developing deliberate practice habits and finding purpose in their pursuits.' },
    ],
    activities: [
      { name: 'The Family Hard Thing Rule', age_range: '6-18', description: 'Each family member chooses one hard thing to pursue with deliberate practice. Share updates weekly. Key rule: you can quit at a natural stopping point, never in a moment of frustration.', time_needed: 'Weekly check-ins, 10 min' },
      { name: 'Grit Stories', age_range: '6-12', description: 'Research and share stories of people who achieved through perseverance rather than natural talent. Discuss: What made them keep going when it was hard?', materials: 'Books or online stories', time_needed: '15-20 minutes' },
    ],
    is_for_me: {
      best_for: ['Parents worried their child gives up too easily', 'Families where natural talent is overvalued', 'Parents of children in sports, music, or academics who hit plateaus', 'Anyone interested in the psychology of achievement'],
      not_ideal_for: ['Parents of very young children (under 5)', 'Those looking for a gentle parenting approach (this is more achievement-focused)'],
      reading_time: '6-7 hours',
      difficulty: 'easy',
      one_line: 'Why passion + perseverance matters more than talent.',
    },
    related_topics: ['motivation', 'resilience', 'achievement', 'deliberate-practice'],
  },

  {
    book_slug: 'the-gift-of-failure',
    overview: 'Jessica Lahey, a teacher and mother, shows how overparenting undermines children\'s competence, confidence, and motivation. Drawing on psychology and her classroom experience, she demonstrates that allowing children to struggle, fail, and recover is one of the greatest gifts a parent can give. The book covers school, homework, household duties, friendships, and extracurriculars.',
    key_concepts: [
      { title: 'Intrinsic Motivation Is the Goal', summary: 'When parents rescue, remind, and micromanage, children lose intrinsic motivation. They learn helplessness instead of competence.', practical_tip: 'Let your child forget their lunch, turn in messy homework, or deal with the consequences of not studying. The short-term discomfort builds long-term capability.' },
      { title: 'Autonomy Supports Learning', summary: 'Research shows that autonomy-supportive parenting (giving children ownership of their responsibilities) produces more motivated, engaged, and resilient learners.', practical_tip: 'Hand over age-appropriate responsibilities completely. A 7-year-old can manage their own backpack. A 10-year-old can handle their homework schedule.' },
      { title: 'Failure Is Information', summary: 'When children fail and recover, they learn: I can handle this. When parents prevent failure, children learn: I can\'t handle this without help.', practical_tip: 'After a failure, ask: "What happened? What did you learn? What will you do differently next time?" — not "Let me fix it for you."' },
      { title: 'Separate the Child from the Achievement', summary: 'Your child is not their grades, their sports performance, or their social status. When parents over-identify with outcomes, children feel their worth is conditional.', practical_tip: 'After a game or test, ask "Did you have fun?" or "What did you learn?" before asking about the score.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: false, takeaway: 'Too young for formal failure experiences, but you can allow age-appropriate struggle (reaching for toys, learning to walk).' },
      { age_range: '3-5', applicable: true, takeaway: 'Let children dress themselves (even mismatched), pour their own drinks (even with spills), and solve conflicts with help rather than rescue.' },
      { age_range: '6-9', applicable: true, takeaway: 'The sweet spot. Hand over homework responsibility, let them manage their own belongings, and resist calling the school about every problem.' },
      { age_range: '10-12', applicable: true, takeaway: 'Critical age to step back. Pre-teens need to manage their own academic and social lives with you as consultant, not manager.' },
      { age_range: '13+', applicable: true, takeaway: 'By now, your teen should be largely managing their own life. Trust the competence you\'ve been building — or start building it now.' },
    ],
    activities: [
      { name: 'The Responsibility Handoff', age_range: '6-12', description: 'Choose one responsibility you currently manage for your child (packing lunch, remembering library books, doing laundry). Fully hand it over. Accept imperfect results for 2 weeks.', time_needed: 'Ongoing' },
      { name: 'Failure Debrief', age_range: '5-18', description: 'When your child fails at something, resist fixing. Instead: "That didn\'t go as planned. How are you feeling? What would you do differently?" Help them own the experience.', time_needed: '10 minutes' },
    ],
    is_for_me: {
      best_for: ['Parents who know they over-help but can\'t stop', 'Helicopter or snowplow parents', 'Parents of school-age children dealing with homework battles', 'Those who want to raise independent, capable children'],
      not_ideal_for: ['Parents who are already hands-off', 'Those looking for early childhood specific advice'],
      reading_time: '5-6 hours',
      difficulty: 'easy',
      one_line: 'The permission slip every over-involved parent needs.',
    },
    related_topics: ['autonomy', 'motivation', 'resilience', 'homework', 'independence'],
  },

  {
    book_slug: 'range',
    overview: 'David Epstein challenges the cult of early specialization with evidence that broadly experienced people often outperform narrow specialists. From sports to science to business, he shows that sampling widely, developing diverse skills, and making unexpected connections leads to more creative, adaptable, and successful individuals. For parents feeling pressure to specialize their children early, this is a liberating read.',
    key_concepts: [
      { title: 'The Sampling Period', summary: 'Most world-class performers went through a "sampling period" in childhood where they tried many activities before finding their focus. Early specialization often leads to burnout.', practical_tip: 'Resist the pressure to find your child\'s "thing" early. Let them try diverse activities through elementary school. Depth comes later.' },
      { title: 'Kind vs. Wicked Learning Environments', summary: 'In "kind" learning environments (chess, golf), patterns repeat and early specialization works. In "wicked" environments (most of real life), breadth and adaptability matter more.', practical_tip: 'The real world is wicked — problems don\'t look like practice drills. Expose children to diverse experiences that build adaptability.' },
      { title: 'Analogical Thinking', summary: 'Innovation comes from connecting ideas across domains. The more diverse your experiences, the more connections you can make. Specialists see problems through one lens; generalists see options.', practical_tip: 'Encourage cross-pollination: ask your child how music is like math, how cooking is like chemistry, how sports strategy is like chess.' },
      { title: 'Match Quality', summary: 'Finding the right fit between a person and their work (or passion) takes time and experimentation. Quitting isn\'t failing — it\'s gathering information about fit.', practical_tip: 'When your child wants to quit an activity, explore why. If it\'s a bad fit (not just difficulty), quitting might be exactly the right move.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: false, takeaway: 'Not directly applicable, but the philosophy supports diverse sensory experiences over structured learning at this age.' },
      { age_range: '3-5', applicable: true, takeaway: 'The golden sampling period begins. Expose to music, sports, art, nature, building, stories, and cooking without pressure to commit.' },
      { age_range: '6-9', applicable: true, takeaway: 'Keep the sampling going. Resist the travel-team pressure. A child who tries 5 activities and quits 4 has learned valuable information about themselves.' },
      { age_range: '10-12', applicable: true, takeaway: 'Natural specialization may begin, driven by the child. Support it while maintaining some breadth. The diversely-skilled child has more options later.' },
      { age_range: '13+', applicable: true, takeaway: 'Even as interests narrow, encourage cross-domain thinking. A teen who plays music, does science, and reads widely will be a more creative thinker.' },
    ],
    activities: [
      { name: 'The Sampling Semester', age_range: '5-12', description: 'Each semester, your child tries one brand-new activity they\'ve never done before. Art? Martial arts? Gardening? Robotics? The goal isn\'t mastery — it\'s exposure.', time_needed: 'One new activity per semester' },
      { name: 'Connection Conversations', age_range: '6-18', description: 'Regularly ask: "How is X like Y?" (How is playing piano like writing code? How is soccer strategy like chess?) This builds analogical thinking.', time_needed: '5 minutes at dinner' },
    ],
    is_for_me: {
      best_for: ['Parents feeling pressured to specialize their child early', 'Families stressed about choosing the "right" activities', 'Parents of multi-interest children who worry about lack of focus', 'Anyone who believes curiosity should guide childhood'],
      not_ideal_for: ['Parents of highly passionate children who already love one thing (that\'s fine too!)', 'Those looking for specific parenting strategies (this is more philosophy)'],
      reading_time: '7-8 hours',
      difficulty: 'moderate',
      one_line: 'The best antidote to the over-specialization pressure parents face.',
    },
    related_approaches: ['unschooling', 'democratic-free'],
    related_topics: ['extracurricular-activities', 'creativity', 'career-development', 'overscheduling'],
  },

  // ══════════════════════════════════════════════════════════════════════
  // STUB CONTENT for remaining books (to be expanded)
  // Each has essential overview and is_for_me, with key concepts
  // ══════════════════════════════════════════════════════════════════════

  {
    book_slug: 'make-it-stick',
    overview: 'The definitive guide to the science of learning. Brown, Roediger, and McDaniel debunk popular study myths (rereading, highlighting, cramming) and present evidence-based techniques: retrieval practice, spaced repetition, interleaving, and elaboration. These techniques are not intuitive but dramatically improve long-term retention.',
    key_concepts: [
      { title: 'Retrieval Practice', summary: 'Testing yourself is far more effective than re-reading. The act of pulling information from memory strengthens the neural pathways for that knowledge.', practical_tip: 'After reading a chapter, close the book and write down everything you remember. This "brain dump" is the single most effective study technique.' },
      { title: 'Spaced Repetition', summary: 'Spreading study sessions over time (vs. cramming) dramatically improves retention. The brain consolidates information during the spaces between practice.', practical_tip: 'Help your child review material 1 day, 3 days, 7 days, and 21 days after learning. Even brief reviews dramatically improve long-term memory.' },
      { title: 'Desirable Difficulties', summary: 'Learning that feels easy often doesn\'t stick. Learning that feels hard — effortful retrieval, spacing, mixing topics — produces stronger, more durable knowledge.', practical_tip: 'Reassure your child: "If studying feels hard, that means it\'s working. Easy studying often means you\'re not really learning."' },
      { title: 'Interleaving', summary: 'Mixing different types of problems or topics during practice (instead of blocking by type) improves the ability to identify and apply the right strategy.', practical_tip: 'Instead of doing 20 multiplication problems then 20 division problems, mix them. The brain learns to discriminate between problem types.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: false, takeaway: 'Not applicable at this age.' },
      { age_range: '3-5', applicable: false, takeaway: 'Not directly applicable, though the principle of spaced repetition applies to learning letters, numbers, etc.' },
      { age_range: '6-9', applicable: true, takeaway: 'Begin teaching simple retrieval practice: "What do you remember from school today?" Quiz games for vocabulary and math facts using spaced repetition.' },
      { age_range: '10-12', applicable: true, takeaway: 'Teach the full toolkit: retrieval practice, spacing, interleaving. Help children create their own flashcard systems and study schedules.' },
      { age_range: '13+', applicable: true, takeaway: 'Essential for academic success. Teens who master these techniques study more efficiently and retain information dramatically better.' },
    ],
    activities: [
      { name: 'The Brain Dump', age_range: '8-18', description: 'After learning something new, set a timer for 5 minutes. Write everything you remember without looking at notes. Then check what you missed. This single technique beats hours of re-reading.', materials: 'Paper, pen', time_needed: '5-10 minutes' },
      { name: 'Flashcard Spacing System', age_range: '7-18', description: 'Create three piles of flashcards: Daily (new/hard), Every 3 Days (medium), Weekly (known). Move cards forward as they\'re mastered, back if forgotten.', materials: 'Index cards', time_needed: '10 minutes daily' },
    ],
    is_for_me: {
      best_for: ['Parents who want to help their children study more effectively', 'Students struggling with retention despite "studying hard"', 'Parents and educators who want evidence-based learning techniques', 'Families frustrated by cramming and poor test results'],
      not_ideal_for: ['Parents of very young children', 'Those looking for parenting relationship advice (this is purely about learning mechanics)'],
      reading_time: '6-7 hours',
      difficulty: 'moderate',
      one_line: 'The user manual for how learning actually works.',
    },
    related_topics: ['homework', 'study-skills', 'academic-achievement', 'learning-styles'],
  },

  {
    book_slug: 'einstein-never-used-flashcards',
    overview: 'Developmental psychologists Hirsh-Pasek and Golinkoff present the research case for play-based learning, demolishing the myth that earlier formal instruction equals better outcomes. They show that children learn language, math, reading, and social skills most effectively through play, conversation, and exploration — not flashcards, apps, and structured lessons.',
    key_concepts: [
      { title: 'Play IS Learning', summary: 'Play is not a break from learning — it IS the primary mechanism of learning for young children. Through play, children develop language, problem-solving, creativity, and social skills.', practical_tip: 'Protect unstructured play time as fiercely as you protect mealtimes. It\'s not "doing nothing" — it\'s the most important work of childhood.' },
      { title: 'The Earlier-Is-Better Myth', summary: 'Research consistently shows that early academic instruction doesn\'t produce lasting advantages and may even harm motivation and curiosity.', practical_tip: 'Don\'t stress about teaching letters at age 2. Children who start formal reading at 7 (as in Finland) catch up quickly and often surpass early readers in enjoyment and comprehension.' },
      { title: 'Conversation Is King', summary: 'The number of words a child hears AND the quality of back-and-forth conversation are the strongest predictors of language development — not flashcards or educational videos.', practical_tip: 'Talk WITH your child, not AT them. Narrate your day, ask open-ended questions, and follow their conversational lead. Quality conversation trumps quantity of exposure.' },
      { title: 'Less Screen, More Scene', summary: 'Young children learn dramatically better from live human interaction than from screens. "Educational" apps and videos rarely deliver what they promise.', practical_tip: 'For children under 3, prioritize real-world exploration over any screen-based "learning." A walk in the neighborhood teaches more than an hour of educational TV.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Core audience. Resist the pressure to "teach" babies. Responsive interaction, rich language, and sensory exploration are all they need.' },
      { age_range: '3-5', applicable: true, takeaway: 'Play-based preschool environments outperform academic-focused ones. Prioritize play, conversation, and exploration over worksheets and drills.' },
      { age_range: '6-9', applicable: true, takeaway: 'The play principle continues. Children who maintain rich play lives alongside academics develop better creativity, problem-solving, and social skills.' },
      { age_range: '10-12', applicable: false, takeaway: 'The book focuses on early childhood, though the principles of play-based learning remain valid.' },
      { age_range: '13+', applicable: false, takeaway: 'Not directly applicable.' },
    ],
    activities: [
      { name: 'Narrated Walk', age_range: '0-5', description: 'Take a walk with no destination. Follow your child\'s curiosity. Narrate what you see, ask questions, let them lead. Count how many learning moments emerge naturally.', time_needed: '20-30 minutes' },
      { name: 'Open-Ended Play Kit', age_range: '1-6', description: 'Create a basket of open-ended materials: blocks, fabric scraps, cardboard tubes, cups, natural objects. No instructions. Watch what your child creates.', materials: 'Assorted open-ended materials', time_needed: 'Ongoing' },
    ],
    is_for_me: {
      best_for: ['Parents of babies and toddlers feeling pressure to "teach" early', 'Anyone worried about falling behind if they don\'t do flashcards and apps', 'Parents who believe in play but want the research to back it up', 'Expecting parents planning their approach to early education'],
      not_ideal_for: ['Parents of older children', 'Those already committed to play-based learning (this confirms what you know)'],
      reading_time: '5-6 hours',
      difficulty: 'easy',
      one_line: 'The research-backed permission slip to let your child play.',
    },
    related_approaches: ['montessori', 'reggio-emilia', 'waldorf-steiner', 'play-based-learning'],
    related_topics: ['play', 'early-learning', 'screen-time', 'language-development'],
  },

  {
    book_slug: 'free-to-learn',
    overview: 'Peter Gray makes the evolutionary case for self-directed education. Drawing on research with hunter-gatherer societies, the Sudbury Valley School, and developmental psychology, he argues that children are biologically designed to learn through play and exploration — and that our coercive schooling system suppresses these instincts, contributing to rising anxiety and depression.',
    key_concepts: [
      { title: 'Children Are Natural Learners', summary: 'Evolution designed children to learn through play, exploration, and observation — not through instruction. The drive to learn is biological.', practical_tip: 'Trust your child\'s curiosity. When they become fascinated by something (bugs, trains, baking), support that interest rather than redirecting to "important" subjects.' },
      { title: 'Play as Education', summary: 'Free play teaches planning, negotiation, creativity, emotional regulation, and physical skills more effectively than structured lessons.', practical_tip: 'Ensure your child has substantial daily unstructured play time with other children. This is not a luxury — it\'s essential developmental work.' },
      { title: 'Age Mixing', summary: 'When children of different ages play together, younger children learn from older ones and older children develop leadership, empathy, and teaching skills.', practical_tip: 'Seek out multi-age play opportunities: neighborhood play, mixed-age homeschool groups, or family gatherings where kids of all ages interact.' },
      { title: 'The Decline of Play and Rise of Anxiety', summary: 'As free play has decreased over 50 years, childhood anxiety and depression have increased. This is not coincidental — play is how children develop coping skills.', practical_tip: 'Audit your child\'s weekly schedule. If structured activities outweigh free play, rebalance. Their mental health depends on it.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Allow exploration without excessive restriction. Trust the developmental drive to learn through sensory experience and movement.' },
      { age_range: '3-5', applicable: true, takeaway: 'Prioritize free play over academic preparation. A 5-year-old who has played freely for years is better prepared for school than one who has been drilled.' },
      { age_range: '6-9', applicable: true, takeaway: 'Protect play time even as school demands increase. After-school time should include significant unstructured play, not just homework and organized activities.' },
      { age_range: '10-12', applicable: true, takeaway: 'Children still need free play. The forms change (building, creating, exploring with friends) but the developmental function remains.' },
      { age_range: '13+', applicable: true, takeaway: 'Teens need autonomy and self-directed projects. Support their interests even if unconventional.' },
    ],
    activities: [
      { name: 'Free Play Audit', age_range: 'Parents', description: 'Track how many hours of completely unstructured, unsupervised (age-appropriate) play your child gets per week. Compare to structured activities. Is the balance healthy?', time_needed: '1 week tracking' },
      { name: 'Interest-Led Project', age_range: '5-18', description: 'Let your child choose any topic they\'re curious about and pursue it for a month. No grades, no requirements. Just support, materials, and enthusiasm.', time_needed: 'Ongoing over 1 month' },
    ],
    is_for_me: {
      best_for: ['Parents questioning the conventional school model', 'Homeschooling or unschooling families', 'Anyone concerned about the decline of play in childhood', 'Parents whose children are stressed, anxious, or unmotivated by school'],
      not_ideal_for: ['Parents fully committed to traditional schooling (may feel threatening)', 'Those looking for specific curriculum or activity ideas'],
      reading_time: '6-7 hours',
      difficulty: 'moderate',
      one_line: 'The evolutionary case for why children need freedom to play and learn.',
    },
    related_approaches: ['unschooling', 'democratic-free', 'sudbury', 'self-directed-learning'],
    related_topics: ['play', 'autonomy', 'anxiety', 'motivation', 'unschooling'],
  },

  {
    book_slug: 'how-children-learn',
    overview: 'John Holt\'s patient, detailed observations of children learning naturally — through games, talk, reading, and exploration. Published in 1967, this classic remains fresh because Holt captures something timeless: the way children teach themselves when given the freedom and trust to do so. A foundational text for understanding that learning is natural, not something imposed from outside.',
    key_concepts: [
      { title: 'Children Are Natural Scientists', summary: 'Children approach the world like researchers — forming hypotheses, testing them, and revising. This natural scientific process is more effective than instruction.', practical_tip: 'When your child asks "why?" don\'t just answer — ask back: "What do you think? How could we find out?" Honor their natural inquiry process.' },
      { title: 'The Strategy of Errors', summary: 'Mistakes are not failures — they\'re experiments. Children learn as much or more from wrong answers as from right ones. Correcting too quickly disrupts the learning process.', practical_tip: 'When your child is wrong, resist immediately correcting. Let them discover the error themselves. The self-correction is where the deepest learning happens.' },
      { title: 'Trust the Learner', summary: 'Children know what they need to learn and when. Given a rich environment and freedom, they will tackle increasingly complex challenges at their own pace.', practical_tip: 'Observe what your child chooses to do when free. Their choices reveal what they\'re ready to learn next.' },
      { title: 'Fear Is the Enemy of Learning', summary: 'When children are afraid of being wrong, looking stupid, or disappointing adults, their learning shuts down. Safety is a prerequisite for curiosity.', practical_tip: 'Create an atmosphere where mistakes are welcome. Share your own mistakes freely. Never mock a child\'s attempt or incorrect answer.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Holt\'s observations of babies learning are profound. Trust the developmental process — babies are learning constantly through every interaction with the world.' },
      { age_range: '3-5', applicable: true, takeaway: 'This is Holt\'s richest terrain. Let preschoolers explore language, numbers, and the physical world on their own terms.' },
      { age_range: '6-9', applicable: true, takeaway: 'As formal schooling begins, maintain trust in your child\'s natural learning ability. Supplement school with rich home experiences.' },
      { age_range: '10-12', applicable: true, takeaway: 'Continue to trust your child\'s interests and learning pace, even when it diverges from school expectations.' },
      { age_range: '13+', applicable: true, takeaway: 'The trust principle applies throughout adolescence. Teens learn best when pursuing genuine interests with autonomy.' },
    ],
    activities: [
      { name: 'Observation Day', age_range: 'Parents (0-8)', description: 'Spend a full day observing your child without directing. Note: What captures their attention? How do they approach problems? What patterns emerge? You\'ll be amazed at the learning happening naturally.', time_needed: '1 day' },
      { name: 'Error Celebration', age_range: '3-12', description: 'At dinner, each person shares their best mistake of the day and what they learned from it. This normalizes errors and makes learning visible.', time_needed: '10 minutes' },
    ],
    is_for_me: {
      best_for: ['Parents curious about how children naturally learn', 'Homeschooling and unschooling families', 'Educators who want to understand learning from the child\'s perspective', 'Anyone who believes children are more capable than the system assumes'],
      not_ideal_for: ['Parents wanting structured how-to advice', 'Those looking for modern, data-driven research (this is observational)'],
      reading_time: '5-6 hours',
      difficulty: 'easy',
      one_line: 'The timeless classic on how children teach themselves — when we let them.',
    },
    related_approaches: ['unschooling', 'democratic-free', 'self-directed-learning'],
    related_topics: ['natural-learning', 'play', 'curiosity', 'homeschooling'],
  },

  // Remaining books with essential content structure
  // Each follows the same pattern with overview, key_concepts, age_takeaways, activities, is_for_me

  {
    book_slug: 'last-child-in-the-woods',
    overview: 'Richard Louv coined the term "nature-deficit disorder" to describe the growing disconnect between children and the natural world. Through research and stories, he shows that direct exposure to nature is essential for healthy childhood development — improving attention, reducing stress, boosting creativity, and building physical health. The book sparked a global movement to get children back outdoors.',
    key_concepts: [
      { title: 'Nature-Deficit Disorder', summary: 'As children spend more time indoors and with screens, they develop symptoms that mimic ADHD, depression, and anxiety. Nature exposure directly counteracts these.', practical_tip: 'Aim for at least one hour of outdoor time in natural settings per day. Yards count, but wild or semi-wild spaces are even better.' },
      { title: 'Nature as Therapy', summary: 'Research shows that time in nature reduces cortisol, improves attention, boosts immune function, and enhances creativity. It\'s not a luxury — it\'s medicine.', practical_tip: 'Before scheduling a doctor visit for attention or anxiety concerns, try a "nature prescription": 2 weeks of daily outdoor time in green spaces.' },
      { title: 'Unstructured Nature Play', summary: 'Building forts, climbing trees, catching frogs, and getting dirty in unstructured ways teaches risk assessment, creativity, and resilience in ways structured activities cannot.', practical_tip: 'Find a patch of nature (even a vacant lot or creek) where your child can explore freely. Resist organizing the play. Let nature be the teacher.' },
      { title: 'The Extinction of Experience', summary: 'Each generation has less direct contact with nature, creating a cycle of disconnection. Children who don\'t play in nature don\'t grow into adults who protect it.', practical_tip: 'Make nature part of your family identity. Regular hikes, camping trips, or even a family garden create experiences that last a lifetime.' },
    ],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Babies benefit enormously from outdoor sensory experiences — wind, sun, grass, water. Take them outside daily, even briefly.' },
      { age_range: '3-5', applicable: true, takeaway: 'The golden age for nature immersion. Mud, bugs, sticks, water, and freedom. Nature-based preschools produce remarkable outcomes.' },
      { age_range: '6-9', applicable: true, takeaway: 'Children need unsupervised or lightly supervised nature play. Building, exploring, and getting lost (safely) build confidence and creativity.' },
      { age_range: '10-12', applicable: true, takeaway: 'Nature adventures — camping, hiking, fishing, gardening — provide the challenge and autonomy pre-teens need.' },
      { age_range: '13+', applicable: true, takeaway: 'Teens who connect with nature have lower rates of anxiety and depression. Nature provides solitude and perspective during identity formation.' },
    ],
    activities: [
      { name: 'Weekly Nature Immersion', age_range: '2-18', description: 'One hour per week in the wildest nature accessible to you. No agenda, no lesson. Just explore. Let children lead. Resist directing and just follow their curiosity.', time_needed: '1 hour weekly' },
      { name: 'The Sit Spot', age_range: '5-18', description: 'Each family member chooses a "sit spot" in nature (a tree, a rock, a garden corner). Visit it regularly and observe what changes — seasons, animals, growth. Keep a nature journal.', materials: 'Journal, pencil', time_needed: '15 minutes, 2-3 times per week' },
    ],
    is_for_me: {
      best_for: ['Parents whose children spend too much time indoors', 'Families in urban environments wanting to connect with nature', 'Parents of children with attention or anxiety challenges', 'Anyone who senses that something is missing in modern childhood'],
      not_ideal_for: ['Families already deeply nature-connected', 'Those looking for specific outdoor activity guides (this is more philosophy and research)'],
      reading_time: '7-8 hours',
      difficulty: 'easy',
      one_line: 'The book that launched the movement to get children back outside.',
    },
    related_approaches: ['nature-based-education', 'forest-school'],
    related_topics: ['outdoor-play', 'nature', 'attention', 'screen-time', 'physical-health'],
  },

  // ──────────────────────────────────────────────────────────────────────
  // The remaining ~45 books use concise content entries
  // Each has the essential fields to power the Book Explorer UI
  // Full content will be generated via API or expanded in future versions
  // ──────────────────────────────────────────────────────────────────────

  ...generateRemainingBookContent(),
];

/**
 * Generate content entries for remaining books
 * These provide essential overview and metadata for the Book Explorer
 * Full key_concepts, activities, and age_takeaways to be expanded over time
 */
function generateRemainingBookContent(): BookContentEntry[] {
  return [
    // PLAY, NATURE & BODY (remaining)
    stubContent('balanced-and-barefoot', 'Angela Hanscom, an occupational therapist, explains how restricting children\'s movement and outdoor play creates sensory and motor deficits. She provides evidence that children need hours of active, unrestricted outdoor play to develop properly — including better attention, emotional regulation, and physical coordination.', ['Parents of fidgety or sensory-seeking children', 'Families where outdoor play time is limited', 'Parents concerned about physical development'], 'easy', 'Why your kid needs to play harder, climb higher, and get dirtier.'),
    stubContent('the-art-of-roughhousing', 'A joyful celebration of physical play — wrestling, tumbling, chasing, and play-fighting. DeBenedet and Cohen show that roughhousing builds emotional intelligence, resilience, ethics, and physical fitness. With illustrations of games and activities organized by age, this is both research-backed and immediately usable.', ['Parents who want to play more physically with their kids', 'Dads looking for engagement activities', 'Families who want to counter the "be careful" culture'], 'easy', 'The science of why wrestling with your kids makes them smarter and kinder.'),
    stubContent('theres-no-such-thing-as-bad-weather', 'Swedish-American mom Linda Åkeson McGurk shares Scandinavian outdoor childhood culture with practical tips for embracing all-weather outdoor play. Combining memoir, cultural comparison, and practical advice, she makes a compelling case that daily outdoor time — rain, snow, or shine — builds resilience, health, and happiness.', ['Parents who want to get outside more but struggle with weather', 'Families interested in Scandinavian parenting philosophy', 'Parents of young children who need more outdoor time'], 'easy', 'A warm, practical guide to outdoor childhood in every season.'),
    stubContent('spark', 'Ratey presents revolutionary research showing that exercise is the single most effective treatment for attention, anxiety, depression, and learning challenges. Physical activity literally rewires the brain — growing new neurons, strengthening connections, and improving every aspect of cognitive function.', ['Parents of children with ADHD or attention challenges', 'Families wanting to understand the exercise-brain connection', 'Anyone interested in optimizing brain health through movement'], 'moderate', 'The neuroscience of why exercise is the best medicine for the brain.'),
    stubContent('playful-learning', 'A beautifully designed guide to activities that prove play and learning are inseparable. Bruehl provides hundreds of hands-on activities across literacy, math, science, art, and social-emotional learning — all through play.', ['Parents looking for play-based learning activities', 'Homeschooling families', 'Parents of preschoolers and early elementary children'], 'easy', 'Hundreds of ideas for making learning joyful.'),

    // EMOTIONAL INTELLIGENCE (remaining)
    stubContent('unselfie', 'Michele Borba identifies nine research-backed habits that build empathy in children, countering the rising narcissism epidemic. From emotional literacy to moral imagination to practicing kindness, she provides a clear roadmap for raising caring, compassionate children.', ['Parents concerned about self-centeredness in their children', 'Families wanting to build empathy and kindness', 'Parents of children ages 5-18'], 'easy', 'The essential playbook for raising empathetic kids in a me-first world.'),
    stubContent('sitting-still-like-a-frog', 'Eline Snel makes mindfulness accessible and fun for children ages 5-12. With simple exercises, guided meditations (included as audio), and a warm, playful approach, this book helps children manage stress, improve focus, and handle difficult emotions.', ['Parents of anxious or easily-overwhelmed children', 'Families wanting to start a mindfulness practice', 'Parents of children ages 5-12'], 'easy', 'Mindfulness for kids that they\'ll actually want to do.'),
    stubContent('planting-seeds', 'Thich Nhat Hanh offers gentle mindfulness practices for children and families, drawing from Buddhist wisdom but accessible to everyone. With songs, guided meditations, and activities for cultivating peace, compassion, and joy.', ['Families interested in mindfulness and contemplative practices', 'Parents seeking calm in a chaotic world', 'Those drawn to Thich Nhat Hanh\'s gentle philosophy'], 'easy', 'Gentle, beautiful mindfulness from one of the world\'s great teachers.'),
    stubContent('the-body-keeps-the-score', 'Van der Kolk\'s groundbreaking work on how trauma is stored in the body — not just the mind. He explores how traumatic stress affects brain development and presents innovative treatments including EMDR, yoga, neurofeedback, and therapeutic relationships. Essential for any parent dealing with their own or their child\'s trauma history.', ['Parents with their own trauma history', 'Caregivers of children who\'ve experienced trauma', 'Anyone wanting to understand the body-brain connection in healing'], 'academic', 'The revolutionary understanding of how trauma lives in the body.'),
    stubContent('raising-good-humans', 'Hunter Clarke-Fields combines mindfulness with practical parenting, focusing on the parent\'s own regulation first. Her approach: when the parent is calm and aware, the child benefits. With exercises, scripts, and real-life examples for breaking the cycle of reactive parenting.', ['Parents who struggle with yelling or reactive parenting', 'Those interested in mindful parenting', 'Parents who know self-regulation starts with them'], 'easy', 'Mindful parenting that starts with you — because you can\'t pour from an empty cup.'),

    // EDUCATION PHILOSOPHY (remaining)
    stubContent('montessori-science-behind-the-genius', 'Lillard connects each Montessori principle to peer-reviewed developmental science. This is the most rigorous academic validation of Montessori methods, demonstrating that Montessori intuitions about child development are consistently supported by modern research.', ['Parents considering Montessori education', 'Educators wanting research validation', 'Those who want evidence, not just philosophy'], 'academic', 'The scientific proof that Montessori works — and why.'),
    stubContent('finnish-lessons', 'Sahlberg explains how Finland built the world\'s most successful education system through trust (not testing), equity (not competition), and play (not pressure). The lessons extend beyond school to parenting philosophy: less anxiety, more trust, better outcomes.', ['Parents frustrated with test-focused education', 'Anyone interested in alternative education systems', 'Parents who value play and trust over pressure'], 'moderate', 'How Finland does education better by doing less.'),
    stubContent('the-element', 'Ken Robinson makes the case that finding the intersection of natural talent and personal passion — what he calls "the Element" — leads to fulfillment and extraordinary achievement. Through stories of creative icons, he shows how our education system often squashes rather than nurtures individual gifts.', ['Parents who want to nurture their child\'s unique talents', 'Families feeling constrained by standardized education', 'Anyone who believes every child has a gift'], 'easy', 'Finding where talent meets passion — for every child.'),
    stubContent('lifelong-kindergarten', 'Resnick, creator of Scratch, argues that the creative, project-based approach of kindergarten — imagining, creating, playing, sharing, reflecting — should be the model for all learning. He presents a vision for education centered on creative thinking.', ['Parents interested in creative and project-based learning', 'Families involved in making, coding, or creative pursuits', 'Educators and parents wanting to rethink learning'], 'moderate', 'Why the best learning looks like kindergarten — at every age.'),
    stubContent('summerhill', 'Neill\'s account of the legendary free school where children govern themselves, attendance is optional, and emotional freedom is prioritized over academic achievement. Whether you agree or not, it challenges every assumption about what children need.', ['Parents questioning conventional education', 'Those interested in democratic and free schools', 'Anyone curious about radical education experiments'], 'easy', 'The original radical experiment in children\'s freedom.'),
    stubContent('the-brave-learner', 'Julie Bogart transforms home education from a chore into an adventure. Whether homeschooling or not, her philosophy of curiosity-led, joyful learning — finding magic in everyday moments — inspires parents to see learning opportunities everywhere.', ['Homeschooling families', 'Parents wanting to supplement school with joyful learning', 'Anyone who wants to make learning an adventure'], 'easy', 'Making education enchanting — at home and everywhere.'),
    stubContent('creative-confidence', 'The Kelley brothers show that creativity is not a gift for the few but a skill anyone can develop. From Stanford\'s d.school and IDEO, they provide a roadmap for reclaiming creative confidence in yourself and nurturing it in your children.', ['Parents who feel "not creative" themselves', 'Families interested in design thinking', 'Parents wanting to nurture creative skills'], 'easy', 'Creativity is a skill, not a talent — here\'s how to build it.'),

    // NEURODIVERSITY
    stubContent('uniquely-human', 'Prizant reframes autism as a difference, not a disorder. Instead of trying to eliminate "autistic behaviors," he shows how to understand and support the person behind them. A compassionate, paradigm-shifting book for parents, educators, and anyone who interacts with autistic individuals.', ['Parents of autistic children', 'Educators and caregivers working with autism', 'Anyone wanting a compassionate understanding of autism'], 'moderate', 'Seeing the person behind the autism — not just the behaviors.'),
    stubContent('differently-wired', 'Debbie Reber offers 18 paradigm shifts for raising children who are differently wired — whether with ADHD, autism, giftedness, learning differences, or any combination. Practical, empowering, and honest about the challenges.', ['Parents of neurodivergent children', 'Families navigating ADHD, autism, giftedness, or learning differences', 'Parents feeling alone in their parenting challenges'], 'easy', 'You\'re not alone — and your differently wired child is going to be okay.'),
    stubContent('the-way-they-learn', 'Tobias helps parents and teachers understand that every child has a unique learning style. By identifying how your child processes information, you can adapt your approach to match their natural way of learning.', ['Parents whose children struggle in traditional school settings', 'Families wanting to understand different learning styles', 'Educators and homeschoolers'], 'easy', 'Understanding how your specific child learns best.'),
    stubContent('smart-moves', 'Hannaford presents the neuroscience of how movement is essential to learning. The body is not just a vehicle for the brain — movement, touch, and physical experience are fundamental to cognitive development.', ['Parents of active, physical learners', 'Families concerned about sedentary lifestyles', 'Anyone interested in the body-brain connection'], 'moderate', 'Why your kid needs to move to think.'),
    stubContent('taking-charge-of-adhd', 'The definitive guide by the world\'s leading ADHD researcher. Barkley provides comprehensive, evidence-based strategies for understanding ADHD, working with schools, managing behavior, and making medication decisions.', ['Parents of children with ADHD', 'Families navigating ADHD diagnosis and treatment', 'Parents wanting the most authoritative ADHD resource'], 'moderate', 'The most comprehensive, research-backed ADHD guide available.'),
    stubContent('brain-body-parenting', 'Delahooke introduces a paradigm shift: children\'s challenging behaviors are communications from their nervous system, not willful defiance. By understanding the body\'s role in behavior, parents can respond with compassion and effectiveness.', ['Parents of children with challenging behaviors', 'Families where behavioral approaches haven\'t worked', 'Anyone interested in the nervous-system approach to parenting'], 'moderate', 'Understanding behavior through the body — a game-changer.'),

    // DIGITAL AGE
    stubContent('screenwise', 'Heitner takes a mentoring approach to children and technology. Instead of fear-based restriction, she shows parents how to guide children toward digital citizenship, critical thinking about media, and healthy technology habits.', ['Parents struggling with screen time decisions', 'Families wanting a balanced approach to technology', 'Parents of children entering the digital world'], 'easy', 'Mentoring your child through the digital world — not just restricting it.'),
    stubContent('the-tech-wise-family', 'Crouch offers 10 concrete commitments for creating a family culture that puts technology in its proper place. Not anti-tech, but pro-intentional, this book helps families prioritize presence, creativity, and real-world engagement.', ['Families feeling overwhelmed by technology', 'Parents wanting intentional tech boundaries', 'Anyone seeking a more present family life'], 'easy', 'Ten commitments for a more intentional relationship with technology.'),
    stubContent('the-anxious-generation', 'Haidt presents alarming data on how smartphones and social media are contributing to the mental health crisis among children and teens. He proposes concrete solutions: delay smartphones, delay social media, more free play, and more independence.', ['Parents of pre-teens and teens', 'Families navigating social media decisions', 'Anyone concerned about youth mental health'], 'moderate', 'The most urgent book about childhood, phones, and mental health.'),
    stubContent('media-moms-digital-dads', 'Uhls cuts through the panic about screens with actual research. A balanced, evidence-based guide that separates real concerns from hype, helping parents make informed decisions about their children\'s media consumption.', ['Parents wanting a research-based perspective on screens', 'Those tired of sensationalized screen-time debates', 'Parents seeking balanced guidance'], 'easy', 'The calm, research-first guide to kids and screens.'),

    // CULTURE, COMMUNITY & GLOBAL
    stubContent('braiding-sweetgrass', 'Kimmerer weaves indigenous wisdom with scientific knowledge, teaching gratitude, reciprocity, and deep connection with the natural world. While not a parenting book, its philosophy of relationship with Earth profoundly enriches how families engage with nature and community.', ['Parents seeking deeper nature connection', 'Families interested in indigenous perspectives', 'Anyone wanting to cultivate gratitude and wonder'], 'moderate', 'A beautiful integration of science and indigenous wisdom.'),
    stubContent('growing-up-global', 'Tavangar provides hundreds of practical activities for raising globally-aware children — from world cuisines to pen pals to understanding different cultures. A treasure trove for parents wanting to expand their family\'s worldview.', ['Families wanting to raise global citizens', 'Parents seeking multicultural activities', 'Homeschooling families studying world cultures'], 'easy', 'Practical activities for raising children at home in the world.'),
    stubContent('it-takes-a-village', 'Clinton makes the case that raising children is a shared responsibility — involving schools, communities, businesses, and government. A reminder that parenting was never meant to be done in isolation.', ['Parents feeling isolated in their parenting journey', 'Those interested in community-based approaches to child-rearing', 'Parents interested in policy and systemic support'], 'easy', 'Parenting is a team sport — and the team is the whole community.'),
    stubContent('hunt-gather-parent', 'Doucleff lived with Maya, Inuit, and Hadzabe families and discovered parenting practices that solve problems Western parents struggle with. From cooperative children to calm toddlers to confident teens, indigenous wisdom offers powerful alternatives to modern parenting stress.', ['Parents struggling with cooperation and behavior', 'Anyone interested in cross-cultural parenting', 'Parents who sense that Western parenting culture is missing something'], 'easy', 'Ancient wisdom for modern parenting struggles.'),
    stubContent('bringing-up-bebe', 'Druckerman discovers the secrets of French parenting — from patient babies who sleep through the night to children who eat everything to parents who maintain their own identities. A fun, insightful cross-cultural perspective.', ['Parents interested in different cultural approaches', 'Those wanting to maintain their own identity while parenting', 'Parents struggling with picky eating or sleep'], 'easy', 'How French parents raise self-sufficient, well-behaved children — without stress.'),

    // BABY & EARLY YEARS
    stubContent('what-to-expect-when-youre-expecting', 'The comprehensive pregnancy reference, covering week-by-week development, symptoms, nutrition, and preparation for birth. Named one of the most influential books of the last 25 years, it answers every question expecting parents have.', ['Expecting parents', 'Anyone planning a pregnancy', 'Parents wanting a comprehensive pregnancy reference'], 'easy', 'The pregnancy bible that generations of parents trust.'),
    stubContent('the-happiest-baby-on-the-block', 'Karp\'s "5 S\'s" technique (Swaddling, Side position, Shushing, Swinging, Sucking) has helped millions of parents calm fussy newborns. Based on the concept of the "fourth trimester," this approach works because it recreates womb-like conditions.', ['New parents with a fussy newborn', 'Expecting parents preparing for the first months', 'Anyone caring for babies 0-3 months'], 'easy', 'Five simple techniques that calm any fussy baby.'),
    stubContent('expecting-better', 'Economist Emily Oster evaluates the actual data behind pregnancy rules and recommendations, separating evidence from fear. Empowering parents to make informed decisions rather than blindly following outdated guidelines.', ['Data-minded expecting parents', 'Anyone frustrated by conflicting pregnancy advice', 'Parents who want to understand the evidence behind recommendations'], 'moderate', 'Finally, someone looked at the actual data behind pregnancy advice.'),
    stubContent('cribsheet', 'Oster tackles the biggest parenting debates of the first years — breastfeeding, sleep training, screen time, daycare — with data instead of judgment. The result is a refreshingly clear-eyed guide to early parenting decisions.', ['New parents making early decisions about feeding, sleep, and childcare', 'Parents overwhelmed by conflicting advice', 'Data-driven decision-makers'], 'moderate', 'Data-driven decisions for the first years — without judgment.'),

    // SLEEP & FEEDING
    stubContent('healthy-sleep-habits-happy-child', 'Weissbluth\'s comprehensive guide covers sleep science and practical solutions from newborn through adolescence. Based on decades of pediatric sleep research, it helps parents understand sleep needs and solve sleep problems at every age.', ['Parents of children with sleep difficulties', 'New parents wanting to establish healthy sleep habits', 'Anyone wanting to understand pediatric sleep science'], 'moderate', 'The definitive guide to children\'s sleep at every age.'),
    stubContent('child-of-mine', 'Satter\'s revolutionary "division of responsibility" framework: parents decide what, when, and where; children decide how much and whether to eat. This approach prevents food battles and builds healthy eating habits for life.', ['Parents struggling with picky eaters', 'Families wanting to end mealtime battles', 'Parents wanting to build a healthy relationship with food'], 'moderate', 'The framework that ends food battles forever.'),

    // TEENAGERS
    stubContent('untangled', 'Damour guides parents through the seven developmental transitions of adolescence: parting with childhood, joining a new tribe, harnessing emotions, contending with adult authority, planning for the future, entering the romantic world, and caring for herself.', ['Parents of teenage girls', 'Anyone trying to understand adolescent girl behavior', 'Parents entering the teen years and wanting to prepare'], 'easy', 'The essential guide to understanding teenage girls.'),
    stubContent('the-emotional-lives-of-teenagers', 'Damour\'s most recent work reframes teen emotions as healthy and normal rather than pathological. She shows parents how to distinguish between expected emotional intensity and genuine mental health concerns.', ['Parents worried about their teen\'s emotional well-being', 'Anyone who finds teen emotions overwhelming', 'Parents wanting to support without overreacting'], 'easy', 'Understanding when teen emotions are normal — and when to worry.'),
    stubContent('brainstorm', 'Siegel applies his brain-science approach to adolescence, showing that teen behavior makes sense when you understand brain development. Reframes the teen years as a period of tremendous potential rather than a phase to survive.', ['Parents of teens who want to understand teen brain development', 'Those struggling with teen behavior', 'Parents wanting a brain-science perspective on adolescence'], 'moderate', 'The teen brain decoded — and why it\'s actually brilliant.'),
    stubContent('how-to-talk-so-teens-will-listen', 'The teen-specific companion to the classic communication guide. Faber and Mazlish adapt their proven techniques for the unique challenges of adolescent communication — privacy, independence, risk-taking, and identity.', ['Parents of teenagers struggling with communication', 'Those who loved "How to Talk So Kids Will Listen"', 'Parents wanting practical teen communication scripts'], 'easy', 'The teen version of the classic — because talking to teens is different.'),

    // DISCIPLINE FRAMEWORKS
    stubContent('good-inside', 'Becky Kennedy\'s core message: children are good inside, and so are their parents. Her approach combines firm boundaries with deep connection, offering specific scripts and strategies for common challenges. The most popular new parenting voice of the 2020s.', ['Parents wanting a modern, connection-based discipline approach', 'Anyone who follows "Dr. Becky" and wants the full framework', 'Parents struggling with guilt about discipline'], 'easy', 'The #1 modern parenting book — sturdy leadership meets deep connection.'),
    stubContent('peaceful-parent-happy-kids', 'Markham\'s three-step approach — Regulate, Connect, Coach — provides a practical pathway from reactive to responsive parenting. She addresses the gap between knowing you shouldn\'t yell and actually being able to stop.', ['Parents who yell and want to stop', 'Those wanting a practical gentle parenting guide', 'Parents looking for the bridge between theory and daily practice'], 'easy', 'The practical guide to actually stopping the yelling.'),
    stubContent('positive-discipline', 'Nelsen\'s 40-year classic on discipline that is both firm AND kind. The Positive Discipline framework teaches mutual respect, encouragement, and long-term character building through natural consequences and family meetings.', ['Parents wanting a structured but respectful discipline system', 'Families ready to implement family meetings', 'Educators and parents looking for a school-home-aligned approach'], 'easy', 'The gold standard for respectful, effective discipline.'),
    stubContent('no-bad-kids', 'Lansbury\'s practical guide to handling toddler challenges — hitting, biting, tantrums, defiance — with calm confidence and respect. Short chapters, real-life examples, and the RIE philosophy made accessible.', ['Parents of toddlers (1-4 years)', 'Anyone dealing with hitting, biting, or tantrums', 'Parents drawn to respectful, RIE-based approaches'], 'easy', 'Calm, confident toddler discipline without shame.'),
    stubContent('how-to-talk-so-little-kids-will-listen', 'The younger-child companion to the classic, adapted specifically for ages 2-7. Faber and King provide age-appropriate tools for the unique chaos of toddlers and young children — with humor and real-life examples.', ['Parents of toddlers and preschoolers (ages 2-7)', 'Those who loved the original "How to Talk" and need the little-kid version', 'Parents dealing with daily power struggles with young children'], 'easy', 'The "How to Talk" method — adapted for the chaos of ages 2-7.'),

    // GENDER-SPECIFIC
    stubContent('reviving-ophelia', 'Pipher\'s landmark examination of how culture pressures adolescent girls, affecting their self-esteem, body image, and identity. Revised with updated insights on social media, this remains essential reading for parents of girls.', ['Parents of girls approaching or in adolescence', 'Anyone wanting to understand cultural pressures on girls', 'Parents concerned about body image and self-esteem'], 'easy', 'The landmark book on protecting adolescent girls\' selves.'),
    stubContent('raising-cain', 'Kindlon and Thompson reveal how boys are taught to suppress emotions, leading to anger, isolation, and mental health struggles. They offer a path toward raising emotionally healthy boys who can express vulnerability.', ['Parents of boys at any age', 'Anyone concerned about boys\' emotional development', 'Parents wanting to raise emotionally healthy men'], 'easy', 'Understanding and protecting the emotional life of boys.'),

    // LITERACY & MATH + CORE ADDITIONS
    stubContent('simplicity-parenting', 'Payne demonstrates that simplifying four areas — environment, rhythm, schedules, and filtering adult world information — dramatically reduces children\'s anxiety and behavior problems. Less stuff, less speed, less screens, more calm.', ['Overwhelmed families wanting to slow down', 'Parents of anxious or overstimulated children', 'Anyone who senses modern childhood has too much of everything'], 'easy', 'The power of less — fewer toys, less scheduling, more peace.'),
    stubContent('the-read-aloud-handbook', 'Trelease presents decades of research showing reading aloud is the single most important thing parents can do for literacy and learning. Includes a treasury of recommended read-aloud books organized by age.', ['Parents wanting to build strong readers', 'Families looking for reading recommendations by age', 'Anyone who wants research-backed motivation to read aloud daily'], 'easy', 'The #1 thing you can do for your child\'s education: read aloud.'),
    stubContent('mathematical-mindsets', 'Boaler destroys the "math brain" myth with research showing everyone can learn mathematics deeply. She presents visual, creative approaches to math that build understanding rather than anxiety, transforming how families think about numbers.', ['Parents of children who "hate math" or believe they\'re "not math people"', 'Families wanting to build mathematical confidence', 'Parents and educators frustrated with rote math instruction'], 'easy', 'There\'s no such thing as "not a math person."'),
    stubContent('raising-a-bilingual-child', 'Pearson provides the definitive practical guide for families raising bilingual children — covering every scenario from one-parent-one-language to community language support. She debunks myths and presents the cognitive benefits of bilingualism.', ['Bilingual and multilingual families', 'Parents wanting to raise their child with two languages', 'Immigrant families navigating language decisions'], 'easy', 'Everything you need to know about raising a child with two languages.'),
  ];
}

function stubContent(
  slug: string,
  overview: string,
  best_for: string[],
  difficulty: 'easy' | 'moderate' | 'academic',
  one_line: string,
): BookContentEntry {
  return {
    book_slug: slug,
    overview,
    key_concepts: [],
    age_takeaways: [
      { age_range: '0-2', applicable: true, takeaway: 'Content available soon — check back for age-specific guidance from this book.' },
      { age_range: '3-5', applicable: true, takeaway: 'Content available soon — check back for age-specific guidance from this book.' },
      { age_range: '6-9', applicable: true, takeaway: 'Content available soon — check back for age-specific guidance from this book.' },
      { age_range: '10-12', applicable: true, takeaway: 'Content available soon — check back for age-specific guidance from this book.' },
      { age_range: '13+', applicable: true, takeaway: 'Content available soon — check back for age-specific guidance from this book.' },
    ],
    activities: [],
    is_for_me: {
      best_for,
      not_ideal_for: [],
      reading_time: '5-7 hours',
      difficulty,
      one_line,
    },
  };
}
