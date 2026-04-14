import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#309ce8',
  bgLight: '#f6f7f8',
  textDark: '#081a27',
  textGray: '#4b5563',
  dotInactive: '#baddf6',
  border: '#e0effb'
};

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

const LEVELS = [
  { id: 'A1', label: 'BAŞLANGIÇ' },
  { id: 'A2', label: 'TEMEL' },
  { id: 'B1', label: 'ORTA' },
  { id: 'B2', label: 'İYİ' },
  { id: 'C1', label: 'İLERİ' },
  { id: 'C2', label: 'UZMAN' }
];

export default function LanguageSelectionScreen() {
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [selectedLang, setSelectedLang] = useState('en');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const currentLangName = LANGUAGES.find(l => l.id === selectedLang)?.name || 'Bir dil seçin';

  const handleContinue = async () => {
    try {
      // Seçimi cihaz hafızasına kaydet
      await AsyncStorage.setItem('@echoword_user_lang', selectedLang);
      
      // push yerine replace kullanarak geçmişi (stack'i) temizle
      router.replace({ pathname: '/home', params: { langId: selectedLang } } as any);
    } catch (error) {
      console.error("Dil kaydedilirken hata:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.pagination}>
          <Pressable 
            onPress={() => router.replace({ pathname: '/', params: { initialStep: 0 } } as Href)}
            hitSlop={15}
          >
            <View style={styles.dotInactive} />
          </Pressable>
          
          <Pressable 
            onPress={() => router.replace({ pathname: '/', params: { initialStep: 1 } } as Href)}
            hitSlop={15}
          >
            <View style={styles.dotInactive} />
          </Pressable>
          
          <View style={styles.activeBar} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Dilini Seç</Text>
        <Text style={styles.subtitle}>
          Hangi dili çalışmak istiyorsun? Öğrenme hedeflerini belirleyelim.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HEDEF DİL</Text>
          <Pressable style={styles.dropdown} onPress={() => setIsModalVisible(true)}>
            <View style={styles.dropdownLeft}>
              <MaterialCommunityIcons name="earth" size={22} color={COLORS.textGray} />
              <Text style={styles.dropdownText}>{currentLangName}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={22} color={COLORS.textGray} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MEVCUT SEVİYE</Text>
            <Text style={styles.linkText}>Seviye rehberi</Text>
          </View>

          <View style={styles.grid}>
            {LEVELS.map((level) => (
              <Pressable
                key={level.id}
                onPress={() => setSelectedLevel(level.id)}
                style={[
                  styles.levelCard,
                  selectedLevel === level.id && styles.levelCardActive
                ]}
              >
                <Text style={[styles.levelId, selectedLevel === level.id && styles.levelIdActive]}>
                  {level.id}
                </Text>
                <Text style={[styles.levelLabel, selectedLevel === level.id && styles.levelLabelActive]}>
                  {level.label}
                </Text>
                {selectedLevel === level.id && <View style={styles.activeDot} />}
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable 
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Devam Et</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </Pressable>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dil Seçin</Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textDark} />
              </Pressable>
            </View>
            <FlatList
              data={LANGUAGES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.langItem}
                  onPress={() => {
                    setSelectedLang(item.id);
                    setIsModalVisible(false);
                  }}
                >
                  <Text style={[styles.langItemText, selectedLang === item.id && styles.langItemActive]}>
                    {item.name}
                  </Text>
                  {selectedLang === item.id && (
                    <MaterialCommunityIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  dotInactive: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#baddf6'
  },
  activeBar: {
    width: 35,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#309ce8'
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#081a27',
    marginBottom: 6
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 25
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#081a27',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  linkText: {
    fontSize: 13,
    color: '#309ce8',
    fontWeight: '600'
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0effb',
    backgroundColor: '#fff'
  },
  dropdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  dropdownText: {
    fontSize: 15,
    color: '#081a27',
    fontWeight: '500'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between'
  },
  levelCard: {
    width: (width - 60) / 2,
    height: 80,
    borderRadius: 18,
    backgroundColor: '#f6f7f8',
    alignItems: 'center',
    justifyContent: 'center'
  },
  levelCardActive: {
    backgroundColor: '#eff8ff',
    borderWidth: 1,
    borderColor: '#309ce8'
  },
  levelId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#081a27'
  },
  levelIdActive: {
    color: '#309ce8'
  },
  levelLabel: {
    fontSize: 10,
    color: '#4b5563',
    marginTop: 2,
    fontWeight: '600'
  },
  levelLabelActive: {
    color: '#309ce8'
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#309ce8'
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 25
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#309ce8',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.7,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#081a27'
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f6f7f8'
  },
  langItemText: {
    fontSize: 16,
    color: '#081a27'
  },
  langItemActive: {
    color: '#309ce8',
    fontWeight: 'bold'
  }
});