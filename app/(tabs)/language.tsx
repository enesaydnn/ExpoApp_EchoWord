import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Tüm dillerin listesi
const LANGUAGES = [
  { id: 'en', name: 'İngilizce' },
  { id: 'tr', name: 'Türkçe' },
  { id: 'de', name: 'Almanca' },
  { id: 'fr', name: 'Fransızca' },
  { id: 'es', name: 'İspanyolca' },
  { id: 'it', name: 'İtalyanca' },
  { id: 'ru', name: 'Rusça' },
  { id: 'ar', name: 'Arapça' },
  { id: 'zh', name: 'Çince' },
  { id: 'ja', name: 'Japonca' },
  { id: 'pt', name: 'Portekizce' },
  { id: 'ko', name: 'Korece' }
];

export default function LanguageSelectionScreen() {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleContinue = async () => {
    try {
      // Seçilen dili kaydet
      await AsyncStorage.setItem('@echoword_user_lang', selectedLang);
      // Ana sayfaya yönlendir
      router.replace({ pathname: '/home', params: { langId: selectedLang } } as any);
    } catch (error) {
      console.error("Kaydetme hatası:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <View style={styles.topSpace} />
        
        <Text style={styles.title}>Fısıltı Başlıyor</Text>
        <Text style={styles.subtitle}>Zihninde yankılanacak dili seç.</Text>

        {/* ECHO (YANKI) TASARIMI */}
        <View style={styles.echoContainer}>
          {/* İç Çember ve Dil Seçici */}
          <View style={styles.echoCircleOuter}>
            <View style={styles.echoCircleInner}>
              <Pressable 
                style={styles.langPick} 
                onPress={() => setIsModalVisible(true)}
              >
                <Text style={styles.langPickText}>
                  {LANGUAGES.find(l => l.id === selectedLang)?.name}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={24} color="#309ce8" />
              </Pressable>
            </View>
          </View>
          
          {/* Arka Plan Dalga Efektleri */}
          <View style={[styles.wave, { width: width * 0.8, height: width * 0.8, opacity: 0.1 }]} />
          <View style={[styles.wave, { width: width * 0.9, height: width * 0.9, opacity: 0.05 }]} />
        </View>
      </View>

      {/* ALT KISIM VE BUTON */}
      <View style={styles.footer}>
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="auto-fix" size={20} color="#94a3b8" />
          <Text style={styles.infoText}>
            Her şey hazır. "Yolculuğa Başla" dediğinde senin için bir kelime hazinesi oluşturacağız.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Yolculuğa Başla</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* DİL SEÇİM MODALI */}
      <Modal 
        visible={isModalVisible} 
        transparent 
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bir Dil Seçin</Text>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.langItem} 
                  onPress={() => { 
                    setSelectedLang(item.id); 
                    setIsModalVisible(false); 
                  }}
                >
                  <Text style={[
                    styles.langItemText, 
                    selectedLang === item.id && styles.langItemTextActive
                  ]}>
                    {item.name}
                  </Text>
                  {selectedLang === item.id && (
                    <MaterialCommunityIcons name="check" size={20} color="#309ce8" />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30
  },
  topSpace: {
    height: 60
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#081a27',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center'
  },
  echoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  echoCircleOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
  echoCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#309ce8',
    shadowOpacity: 0.15,
    shadowRadius: 20
  },
  langPick: {
    alignItems: 'center',
    gap: 5
  },
  langPickText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#081a27'
  },
  wave: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#309ce8'
  },
  footer: {
    padding: 30,
    gap: 20
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  infoText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    flex: 1
  },
  button: {
    backgroundColor: '#309ce8',
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#081a27',
    marginBottom: 15,
    textAlign: 'center'
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9'
  },
  langItemText: {
    fontSize: 16,
    color: '#475569'
  },
  langItemTextActive: {
    color: '#309ce8',
    fontWeight: 'bold'
  }
});