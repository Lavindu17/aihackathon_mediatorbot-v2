import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Users, Heart, Shield, Zap, Brain, ChevronRight, X } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const [showMenu, setShowMenu] = useState(false);

  const handleStart = (route: string) => {
    setShowMenu(false);
    // Add a small delay for the modal to close smoothly
    setTimeout(() => router.push(route), 200);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <View style={styles.hero}>
          <View style={styles.logoBadge}>
            <MessageCircle size={32} color="#2563EB" />
          </View>
          <Text style={styles.heroTitle}>Resolve Conflict.{'\n'}Restore Connection.</Text>
          <Text style={styles.heroSubtitle}>
            Your private, AI-powered mediator. Fair, unbiased, and designed to help you understand each other.
          </Text>
        </View>

        {/* HERO IMAGE / GRAPHIC PLACEHOLDER */}
        <View style={styles.graphicContainer}>
          <LinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            style={styles.graphicCircle}
          >
            <Heart size={64} color="#3B82F6" fill="#BFDBFE" />
          </LinearGradient>
        </View>

        {/* VALUE PROPS */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Shield size={24} color="#059669" style={{marginBottom: 8}} />
            <Text style={styles.featureTitle}>100% Private</Text>
            <Text style={styles.featureDesc}>Your partner cannot see your private chat.</Text>
          </View>
          <View style={styles.featureCard}>
            <Brain size={24} color="#7C3AED" style={{marginBottom: 8}} />
            <Text style={styles.featureTitle}>Unbiased AI</Text>
            <Text style={styles.featureDesc}>A neutral third party that validates both sides.</Text>
          </View>
        </View>

        {/* HOW IT WORKS */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>How it works</Text>
          
          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Chat Privately</Text>
              <Text style={styles.stepDesc}>Tell the AI your side of the story. It listens and asks questions to understand.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Invite Partner</Text>
              <Text style={styles.stepDesc}>Share a secure code. Your partner chats privately with the AI.</Text>
            </View>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Resolution</Text>
              <Text style={styles.stepDesc}>Receive a shared analysis and personalized advice for both of you.</Text>
            </View>
          </View>
        </View>

        <View style={{height: 100}} /> 
      </ScrollView>

      {/* FLOATING ACTION BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.mainButton}
          onPress={() => setShowMenu(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.gradientBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.mainButtonText}>Get Started</Text>
            <ChevronRight size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* SELECTION MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowMenu(false)} />
          
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose an option</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleStart('/create')}>
              <View style={[styles.iconBox, {backgroundColor: '#DBEAFE'}]}>
                <MessageCircle size={24} color="#2563EB" />
              </View>
              <View style={{flex:1}}>
                <Text style={styles.optionTitle}>Initiate Session</Text>
                <Text style={styles.optionSub}>I want to start a new mediation.</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => handleStart('/join')}>
              <View style={[styles.iconBox, {backgroundColor: '#DCFCE7'}]}>
                <Users size={24} color="#059669" />
              </View>
              <View style={{flex:1}}>
                <Text style={styles.optionTitle}>Join Session</Text>
                <Text style={styles.optionSub}>I have a code from my partner.</Text>
              </View>
              <ChevronRight size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  
  hero: { marginTop: 40, alignItems: 'center' },
  logoBadge: { padding: 12, backgroundColor: '#EFF6FF', borderRadius: 20, marginBottom: 20 },
  heroTitle: { fontSize: 36, fontWeight: '800', color: '#0F172A', textAlign: 'center', lineHeight: 44, letterSpacing: -1 },
  heroSubtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 16, lineHeight: 24, maxWidth: '90%' },

  graphicContainer: { alignItems: 'center', marginVertical: 40 },
  graphicCircle: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#BFDBFE' },

  featuresGrid: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  featureCard: { flex: 1, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  featureTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  featureDesc: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },

  section: { marginBottom: 20 },
  sectionHeader: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  stepRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '700' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  stepDesc: { fontSize: 14, color: '#64748B', lineHeight: 20 },

  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: 'rgba(255,255,255,0.9)', borderTopWidth: 1, borderColor: '#F1F5F9' },
  mainButton: { borderRadius: 16, overflow: 'hidden', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  gradientBtn: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  mainButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  
  optionCard: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#F8FAFC', borderRadius: 16, marginBottom: 12, gap: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  optionSub: { fontSize: 13, color: '#64748B' },
});