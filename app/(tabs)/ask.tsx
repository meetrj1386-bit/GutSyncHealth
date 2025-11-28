import React, { useState, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

const suggestedQuestions = [
  { icon: '🤒', text: 'My kid has fever, what foods help?' },
  { icon: '💊', text: 'Can I take iron with coffee?' },
  { icon: '🦠', text: 'How to improve my gut health?' },
  { icon: '😴', text: 'Foods that help with sleep?' },
  { icon: '⚡', text: 'Why do I feel tired after eating?' },
  { icon: '🥛', text: 'Is dairy bad for gut health?' },
];

// Simulated AI responses
const getAIResponse = (question: string): string => {
  const q = question.toLowerCase();
  
  if (q.includes('fever') || q.includes('kid') || q.includes('child')) {
    return "For a child with fever, focus on:\n\n🍵 **Hydration first** - Water, clear broths, electrolyte drinks\n\n🍌 **Easy-to-digest foods** - Bananas, rice, applesauce, toast (BRAT diet)\n\n🍯 **Honey** (if over 1 year) - Soothes throat, natural antibacterial\n\n🥣 **Warm soups** - Chicken soup really does help!\n\n❌ **Avoid** - Dairy (can increase mucus), heavy/greasy foods, too much sugar\n\n💡 **Tip**: Small, frequent meals are better than forcing large ones. If fever persists over 3 days, consult your pediatrician.";
  }
  
  if (q.includes('iron') && q.includes('coffee')) {
    return "Great question! **Coffee significantly reduces iron absorption** - by up to 80%! ☕\n\n⏰ **Best practice**: Take iron 2 hours before OR 4 hours after coffee\n\n✅ **Better absorption**: Take iron with vitamin C (orange juice) on an empty stomach\n\n❌ **Also avoid with iron**: Tea, dairy, calcium supplements, antacids\n\n💡 **Pro tip**: If you take iron in the morning, have your coffee at lunch instead.";
  }
  
  if (q.includes('gut health') || q.includes('improve gut')) {
    return "Here's your gut health action plan! 🦠\n\n**1. Feed good bacteria:**\n- Fiber-rich foods (vegetables, legumes, whole grains)\n- Fermented foods (yogurt, kefir, sauerkraut, kimchi)\n\n**2. Avoid gut disruptors:**\n- Processed foods & artificial sweeteners\n- Excessive alcohol\n- Unnecessary antibiotics\n\n**3. Lifestyle factors:**\n- Manage stress (gut-brain connection is real!)\n- Sleep 7-8 hours\n- Exercise regularly\n\n**4. Consider supplements:**\n- Probiotics (multi-strain)\n- L-glutamine for gut lining\n- Digestive enzymes if needed\n\n💡 **Your data shows**: Your gut scores are best on days you eat before 7pm!";
  }
  
  if (q.includes('sleep') || q.includes('tired')) {
    return "Foods that support better sleep: 😴\n\n**Eat these:**\n🍌 Bananas - contain magnesium & tryptophan\n🥜 Almonds - natural melatonin\n🍒 Tart cherries - proven to improve sleep\n🦃 Turkey - rich in tryptophan\n🍵 Chamomile tea - calming effect\n\n**Avoid before bed:**\n❌ Caffeine (even 6 hours before!)\n❌ Heavy, fatty meals\n❌ Spicy foods\n❌ Alcohol (disrupts sleep cycles)\n❌ Too much liquid\n\n⏰ **Timing tip**: Finish eating 2-3 hours before bed for best results.";
  }
  
  if (q.includes('dairy') || q.includes('milk')) {
    return "Dairy and gut health - it's personal! 🥛\n\n**For some people, dairy is fine:**\n- Good source of probiotics (yogurt, kefir)\n- Contains calcium and protein\n\n**For others, it causes issues:**\n- Lactose intolerance → bloating, gas, discomfort\n- Casein sensitivity → inflammation\n\n**How to know?**\n1. Try eliminating dairy for 2-3 weeks\n2. Reintroduce and note symptoms\n3. Track in GutSync!\n\n**Alternatives:**\n- Lactose-free dairy\n- Fermented dairy (often better tolerated)\n- Plant-based options with added calcium\n\n💡 Based on your profile, you haven't flagged dairy sensitivity. Try tracking after dairy meals!";
  }
  
  return "That's a great question! 🤔\n\nBased on what we know about nutrition and gut health, I'd recommend:\n\n1. **Listen to your body** - Everyone responds differently\n2. **Track your meals** - Use GutSync to find patterns\n3. **Stay consistent** - Give changes 2-3 weeks to show effects\n\nFor specific medical concerns, please consult with your healthcare provider.\n\n💡 **Would you like me to help you track this in your food log?**";
};

export default function AskScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles" size={48} color="#4A7C59" />
            </View>
            <Text style={styles.emptyTitle}>Hi! I'm your Health Assistant 👋</Text>
            <Text style={styles.emptySubtitle}>
              Ask me anything about gut health, nutrition, medications, or supplements
            </Text>

            <Text style={styles.suggestedTitle}>Try asking:</Text>
            <View style={styles.suggestedGrid}>
              {suggestedQuestions.map((q, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestedCard}
                  onPress={() => sendMessage(q.text)}
                >
                  <Text style={styles.suggestedIcon}>{q.icon}</Text>
                  <Text style={styles.suggestedText}>{q.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {!message.isUser && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="leaf" size={16} color="#FFFFFF" />
                  </View>
                )}
                <View style={[
                  styles.messageContent,
                  message.isUser ? styles.userContent : styles.aiContent,
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.isUser && styles.userMessageText,
                  ]}>
                    {message.text}
                  </Text>
                </View>
              </View>
            ))}
            {isTyping && (
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="leaf" size={16} color="#FFFFFF" />
                </View>
                <View style={[styles.messageContent, styles.aiContent]}>
                  <ActivityIndicator size="small" color="#4A7C59" />
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Ask about gut health, meds, supplements..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={inputText.trim() ? '#FFFFFF' : '#9CA3AF'} />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>
          For informational purposes only. Not medical advice.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#636E72',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  suggestedGrid: {
    width: '100%',
  },
  suggestedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  suggestedText: {
    flex: 1,
    fontSize: 14,
    color: '#2D3436',
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  aiBubble: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 4,
  },
  messageContent: {
    borderRadius: 18,
    padding: 14,
    maxWidth: '100%',
  },
  userContent: {
    backgroundColor: '#4A7C59',
    borderBottomRightRadius: 4,
  },
  aiContent: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F5F7F5',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3436',
    maxHeight: 100,
    paddingVertical: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A7C59',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  disclaimer: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
});
