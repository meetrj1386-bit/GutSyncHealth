import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { useCheckIns, useMeals, useSupplements, useInsights } from '../../lib/data';
import { supabase } from '../../lib/supabase';
import { Colors, Spacing, FontSizes, BorderRadius, Shadows, SYMPTOMS } from '../../lib/theme';

const OPENAI_CHAT_URL = 'https://ujgwbcxbglypvoztijgo.supabase.co/functions/v1/openai-chat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "🍽️ What should I eat now?",
  "🎈 Why am I bloated?",
  "⚡ Why did my energy crash?",
  "💊 Should I take magnesium now?",
  "🦠 Which supplement helps my gut?",
  "😴 How can I sleep better?",
  "🥗 Best breakfast for gut health?",
  "🍬 How to reduce sugar cravings?",
];

export default function AskScreen() {
  const { profile } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get user data for context
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { checkIns } = useCheckIns({ start: weekAgo, end: new Date() });
  const { meals } = useMeals('week');
  const { supplements } = useSupplements();
  const { insights } = useInsights();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add welcome message on mount
  useEffect(() => {
    const firstName = profile?.name?.split(' ')[0] || 'there';
    setMessages([{
      id: '1',
      role: 'assistant',
      content: `Hey ${firstName}! 💚 I'm your personal Health Coach.\n\nI can see your meals, check-ins, and supplements — so I give you advice that's actually personalized to YOU.\n\n💬 Ask me:\n• "What should I eat right now?"\n• "Why am I bloated?"\n• "Which supplement is best for me?"\n• "How to boost my energy today?"\n\nLet's optimize your gut health together! 🚀`
    }]);
  }, [profile]);

  // Build context from user data
  const buildUserContext = () => {
    const context: string[] = [];
    
    // Profile info
    if (profile?.name) {
      context.push(`User's name: ${profile.name}`);
    }
    if (profile?.health_conditions) {
      context.push(`Health conditions: ${profile.health_conditions}`);
    }
    if (profile?.food_sensitivities) {
      context.push(`Food sensitivities: ${profile.food_sensitivities}`);
    }
    
    // Recent check-ins
    if (checkIns.length > 0) {
      const recentCheckIn = checkIns[0];
      context.push(`Most recent check-in: Gut ${recentCheckIn.gut}/10, Energy ${recentCheckIn.energy}/10, Mood ${recentCheckIn.mood}/10`);
      
      if (recentCheckIn.symptoms && recentCheckIn.symptoms.length > 0) {
        const symptomLabels = recentCheckIn.symptoms.map(s => 
          SYMPTOMS.find(sym => sym.id === s)?.label || s
        );
        context.push(`Current symptoms: ${symptomLabels.join(', ')}`);
      }
      
      // Calculate averages
      const avgGut = checkIns.reduce((sum, c) => sum + c.gut, 0) / checkIns.length;
      const avgEnergy = checkIns.reduce((sum, c) => sum + c.energy, 0) / checkIns.length;
      const avgMood = checkIns.reduce((sum, c) => sum + c.mood, 0) / checkIns.length;
      context.push(`7-day averages: Gut ${avgGut.toFixed(1)}/10, Energy ${avgEnergy.toFixed(1)}/10, Mood ${avgMood.toFixed(1)}/10`);
    }
    
    // Recent meals
    if (meals.length > 0) {
      const recentMeals = meals.slice(0, 5).map(m => `${m.meal_type}: ${m.description} (gut score: ${m.gut_score || 'N/A'})`);
      context.push(`Recent meals: ${recentMeals.join('; ')}`);
    }
    
    // Supplements
    if (supplements.length > 0) {
      const suppList = supplements.map(s => s.name);
      context.push(`Current supplements: ${suppList.join(', ')}`);
    }
    
    // Insights
    if (insights) {
      if (insights.topSymptoms.length > 0) {
        const topSymp = insights.topSymptoms.slice(0, 3).map(s => 
          `${SYMPTOMS.find(sym => sym.id === s.symptom)?.label || s.symptom} (${s.count}x)`
        );
        context.push(`Common symptoms this week: ${topSymp.join(', ')}`);
      }
      context.push(`Gut trend: ${insights.gutTrend}`);
    }
    
    return context.join('\n');
  };

  // Build conversation prompt from message history
  const buildConversationPrompt = (prevMessages: Message[], newMessage: string): string => {
    // Include last few messages for context (skip welcome message with id '1')
    const recentMessages = prevMessages
      .filter(m => m.id !== '1')
      .slice(-6) // Last 6 messages for context
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
    
    if (recentMessages) {
      return `Previous conversation:\n${recentMessages}\n\nUser's new question: ${newMessage}`;
    }
    return newMessage;
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const userContext = buildUserContext();
      
      const systemPrompt = `You are a friendly, knowledgeable gut health AI assistant called GutSync AI. You help users understand their digestive health, food choices, and overall wellness.

USER'S HEALTH DATA:
${userContext}

GUIDELINES:
- Be warm, supportive, and encouraging
- Give specific, actionable advice based on their data
- Reference their actual meals, symptoms, and patterns when relevant
- Explain the "why" behind recommendations
- Keep responses concise but helpful (2-4 paragraphs max)
- If they ask about something not in their data, give general gut health advice
- Use emojis occasionally to be friendly
- Never diagnose medical conditions - recommend seeing a doctor for serious concerns
- Focus on gut health, nutrition, supplements, and lifestyle factors`;

      const response = await fetch(OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          // Edge Function expects: { systemMessage, prompt }
          systemMessage: systemPrompt,
          prompt: buildConversationPrompt(messages, messageText),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || data.message || data.content || "I'm sorry, I couldn't process that request. Please try again.",
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please check your internet connection and try again. 🔄",
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💚 Health Coach</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' && styles.userMessageText,
              ]}>
                {message.content}
              </Text>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <View style={styles.typingIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.typingText}>Thinking...</Text>
              </View>
            </View>
          )}

          {/* Suggested Questions (show only at start) */}
          {messages.length === 1 && (
            <View style={styles.suggestedContainer}>
              <Text style={styles.suggestedTitle}>Try asking:</Text>
              <View style={styles.suggestedGrid}>
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestedChip}
                    onPress={() => sendMessage(question)}
                  >
                    <Text style={styles.suggestedChipText}>{question}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything about your gut health..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            underlineColorAndroid="transparent"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { fontSize: FontSizes.md, color: Colors.primary, fontWeight: '500' },
  title: { fontSize: FontSizes.lg, fontWeight: '600', color: Colors.text },
  
  messagesContainer: { flex: 1 },
  messagesContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  
  messageBubble: { maxWidth: '85%', padding: Spacing.md, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderBottomLeftRadius: 4, ...Shadows.sm },
  messageText: { fontSize: FontSizes.md, color: Colors.text, lineHeight: 22 },
  userMessageText: { color: Colors.textInverse },
  
  typingIndicator: { flexDirection: 'row', alignItems: 'center' },
  typingText: { marginLeft: Spacing.sm, fontSize: FontSizes.sm, color: Colors.textMuted },
  
  suggestedContainer: { marginTop: Spacing.md },
  suggestedTitle: { fontSize: FontSizes.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  suggestedGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  suggestedChip: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginRight: Spacing.sm, marginBottom: Spacing.sm },
  suggestedChipText: { fontSize: FontSizes.sm, color: Colors.primary },
  
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  input: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSizes.md, color: Colors.text, maxHeight: 100, marginRight: Spacing.sm },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { backgroundColor: Colors.border },
  sendButtonText: { color: Colors.textInverse, fontSize: FontSizes.xl, fontWeight: '600' },
});
