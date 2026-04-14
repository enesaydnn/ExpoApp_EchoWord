import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { refreshNotifications } from './notifications';

const { width } = Dimensions.get('window');

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

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [words, setWords] = useState<any[]>([]);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<{ id: string, kelime: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (selectedLang?.id) {
        loadWords(selectedLang.id);
      }
    }, [selectedLang])
  );

  useEffect(() => {
    const initializeLang = async () => {
      let langIdToUse = params.langId as string;
      if (!langIdToUse) {
        langIdToUse = await AsyncStorage.getItem('@echoword_user_lang') || 'en';
      }
      const lang = LANGUAGES.find(l => l.id === langIdToUse);
      if (lang) setSelectedLang(lang);
    };
    initializeLang();
  }, [params.langId]);

  const loadWords = async (currentLangId: string) => {
    try {
      const storedWords = await AsyncStorage.getItem('@echoword_data');
      if (storedWords) {
        const parsedWords = JSON.parse(storedWords);
        const filteredWords = parsedWords
          .filter((w: any) => w.langId === currentLangId)
          .sort((a: any, b: any) => b.createdAt - a.createdAt);
        setWords(filteredWords);
      } else {
        setWords([]);
      }
    } catch (error) {
      console.error("Kelime okuma hatası:", error);
    }
  };

  const handleDeleteRequest = (id: string, kelimeText: string) => {
    setWordToDelete({ id, kelime: kelimeText });
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!wordToDelete) return;
    
    try {
      const storedWords = await AsyncStorage.getItem('@echoword_data');
      if (storedWords) {
        let parsedWords = JSON.parse(storedWords);
        parsedWords = parsedWords.filter((w: any) => w.id !== wordToDelete.id);
        await AsyncStorage.setItem('@echoword_data', JSON.stringify(parsedWords));
        
        // AWAIT KALDIRILDI! UI anında tepki verecek, bildirimler arka planda silinecek.
        refreshNotifications();

        loadWords(selectedLang.id);
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    } finally {
      setDeleteModalVisible(false);
      setWordToDelete(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.leftActions}>        
          <Pressable 
            onPress={() => router.push('/time' as Href)} 
            style={styles.iconButton}
          >
            <MaterialCommunityIcons name="clock-outline" size={24} color="#0f172a" />
          </Pressable>
        </View>

        <Pressable style={styles.langSelector} onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="translate" size={18} color="#309ce8" />
          <Text style={styles.langText}>{selectedLang.name}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color="#cbd5e1" />
        </Pressable>
      </View>

      {words.length === 0 ? (
        <View style={styles.content}>
          <View style={styles.imageBackground}>
            <View style={styles.imageCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1000&auto=format&fit=crop' }} 
                style={styles.image} 
              />
            </View>
          </View>

          <Text style={styles.title}>Zihnine Fısılda</Text>
          <Text style={styles.subtitle}>
            Koleksiyonuna yeni kelimeler fısıldamaya başla. Her küçük adım akıcılığını artırır.
          </Text>
        </View>
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.wordCard}>
              <View style={styles.wordInfo}>
                <Text style={styles.wordText}>{item.kelime}</Text>
                <Text style={styles.meaningText}>{item.anlam}</Text>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{item.zorluk}</Text>
                </View>
              </View>
              <View style={styles.wordActions}>
                <Pressable 
                  style={styles.actionBtn} 
                  onPress={() => router.push({
                    pathname: '/add-word',
                    params: { langId: selectedLang.id, editId: item.id, kelime: item.kelime, anlam: item.anlam, zorluk: item.zorluk }
                  } as any)}
                >
                  <MaterialCommunityIcons name="pencil" size={20} color="#309ce8" />
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => handleDeleteRequest(item.id, item.kelime)}>
                  <MaterialCommunityIcons name="delete" size={20} color="#309ce8" />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Pressable 
          style={styles.actionButton}
          onPress={() => router.push({ pathname: '/add-word', params: { langId: selectedLang.id } } as any)} 
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Kelime Ekle</Text>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalBody}>
                <Text style={styles.modalTitle}>Dil Seçin</Text>
                <FlatList
                  data={LANGUAGES}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable 
                      style={[
                        styles.langItem, 
                        selectedLang.id === item.id && styles.activeLangItem
                      ]}
                      onPress={() => {
                        setSelectedLang(item);
                        setModalVisible(false);
                      }}
                    >
                      <Text style={[
                        styles.langItemText, 
                        selectedLang.id === item.id && styles.activeLangText
                      ]}>
                        {item.name}
                      </Text>
                      {selectedLang.id === item.id && (
                        <MaterialCommunityIcons name="check" size={20} color="#309ce8" />
                      )}
                    </Pressable>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertBox}>
            <View style={styles.alertIconWrapper}>
              <MaterialCommunityIcons name="trash-can-outline" size={32} color="#309ce8" />
            </View>
            <Text style={styles.alertTitle}>Emin misin?</Text>
            <Text style={styles.alertMessage}>
              <Text style={{fontWeight: 'bold'}}>"{wordToDelete?.kelime}"</Text> kelimesini silmek istediğinden emin misin? Bu işlem geri alınamaz.
            </Text>
            
            <View style={styles.alertButtonsRow}>
              <Pressable 
                style={[styles.alertButton, styles.alertCancelButton]} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.alertCancelText}>İptal</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.alertButton, styles.alertDeleteButton]} 
                onPress={confirmDelete}
              >
                <Text style={styles.alertDeleteText}>Sil</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  langSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 40
  },
  imageBackground: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#eff6ff',
    borderRadius: width,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40
  },
  imageCard: {
    width: '85%',
    height: '85%',
    backgroundColor: '#fff',
    borderRadius: 35,
    padding: 10,
    shadowColor: '#309ce8',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5
  },
  image: {
    flex: 1,
    borderRadius: 28
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22
  },
  footer: {
    padding: 30,
    paddingBottom: 40
  },
  actionButton: {
    backgroundColor: '#309ce8',
    flexDirection: 'row',
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBody: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 15,
    textAlign: 'center'
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 15
  },
  activeLangItem: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12
  },
  langItemText: {
    fontSize: 16,
    color: '#475569'
  },
  activeLangText: {
    color: '#309ce8',
    fontWeight: '700'
  },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0effb'
  },
  wordInfo: {
    flex: 1
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#081a27',
    marginBottom: 4
  },
  meaningText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  difficultyText: {
    fontSize: 11,
    color: '#309ce8',
    fontWeight: '600'
  },
  wordActions: {
    flexDirection: 'row',
    gap: 10
  },
  actionBtn: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8
  },
  alertBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15
  },
  alertIconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#f1f5f9',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8
  },
  alertMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  alertButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  alertButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  alertCancelButton: {
    backgroundColor: '#f1f5f9'
  },
  alertCancelText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '700'
  },
  alertDeleteButton: {
    backgroundColor: '#309ce8'
  },
  alertDeleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});