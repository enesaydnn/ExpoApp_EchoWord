import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#309ce8', 
  bgLight: '#f6f7f8',
  textDark: '#081a27',
  textGray: '#4b5563',
  dotInactive: '#baddf6',
  outline: '#e0effb'
};

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Uygulama ilk açıldığında dil seçilmiş mi diye kontrol ediyoruz
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('@echoword_user_lang');
        if (savedLang) {
          // Eğer dil kaydedilmişse direkt home sayfasına replace et (geri dönülemez)
          router.replace({ pathname: '/home', params: { langId: savedLang } } as any);
        } else {
          // Kayıt yoksa tanıtımı göster
          setIsLoading(false);
        }
      } catch (error) {
        setIsLoading(false);
      }
    };
    
    checkOnboarding();
  }, []);

  const handleStepChange = (newStep: number) => {
    if (newStep < 0) return;
    if (newStep > 3) {
      // push yerine replace kullanıyoruz ki geri tuşuyla buraya dönülemesin
      router.replace('/language' as Href);
    } else {
      setStep(newStep);
    }
  };

  const renderPhoneContent = () => {
    if (step === 0) {
      return (
        <View style={styles.card}>
          <MaterialCommunityIcons name="school" size={48} color={COLORS.primary} />
          <Text style={styles.cardTitle}>Vocabulary</Text>
          <View style={styles.separator} />
          <Text style={styles.cardSubtitle}>noun</Text>
          <Text style={styles.cardContent}>Alexander</Text>
        </View>
      );
    } 
    else if (step === 1) {
      return (
        <View style={styles.card}>
          <MaterialCommunityIcons name="close" size={20} color="#e5e7eb" style={styles.closeIcon} />
          <View style={styles.mockLineShort} />
          <View style={styles.mockLineMedium} />
          <View style={styles.mockInput}>
            <Text style={styles.inputText}>Serendipity</Text>
            <View style={styles.cursor} />
          </View>
          <View style={styles.mockLineShort} />
          <View style={styles.mockBox} />
          <View style={styles.fab}>
            <MaterialCommunityIcons name="plus" size={28} color="#fff" />
          </View>
        </View>
      );
    } 
    else if (step === 2) {
      return (
        <View style={styles.lockScreenContainer}>
          <Text style={styles.lockDate}>Salı, 12 Eylül</Text>
          <Text style={styles.lockTime}>09:41</Text>
          <View style={styles.notificationCard}>
            <View style={styles.notifHeader}>
              <View style={styles.notifIconWrapper}>
                <MaterialCommunityIcons name="school" size={12} color="#fff" />
              </View>
              <Text style={styles.notifTimeText}>ŞİMDİ</Text>
            </View>
            <Text style={styles.notifTitle}>Serendipity</Text>
            <Text style={styles.notifDesc}>Tatlı tesadüf</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.card}>
        <MaterialCommunityIcons name="rocket-launch" size={48} color={COLORS.primary} />
        <Text style={styles.cardTitle}>Başlamaya Hazırsın</Text>
        <View style={styles.separator} />
        <Text style={styles.cardSubtitle}>action</Text>
        <Text style={styles.cardContent}>Hemen Öğren</Text>
      </View>
    );
  };

  const texts = [
    { title: "EchoWord", desc: "Öğrenilen bilgiler zamanla unutulabilir. Doğru aralıklarla yapılan tekrar ise hafızayı güçlendirir." },
    { title: "Kendi Kelimelerinle\nÖğren", desc: "Hazır listeler yok. Öğrendiğin kelimeleri kendin ekle. Sistem sana doğru zamanda tekrar hatırlatır." },
    { title: "Doğru Zamanda Hatırla", desc: "Seçtiğin saat aralıklarında sana rastgele kelimeler gönderilir. Tekrar ettikçe kelimeler daha uzun aralıklarla gösterilir." },
    { title: "Yolculuk Başlıyor", desc: "Tüm sistem senin için hazırlandı. Şimdi giriş yap ve kelime hazineni oluşturmaya başla." }
  ];

  // AsyncStorage kontrolü yapılırken beyaz ekran (veya boşluk) gösterilir
  if (isLoading) return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Pressable onPress={() => router.replace('/language' as Href)} hitSlop={20}>
          <Text style={styles.skipText}>Atla</Text>
        </Pressable>
      </View>
      <View style={styles.contentArea}>
        <View style={styles.mockupContainer}>
          <View style={[styles.phoneMockupBackground, step === 2 && styles.phoneMockupOutline]}>
            {renderPhoneContent()}
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.mainTitle}>{texts[step].title}</Text>
          <Text style={styles.description}>{texts[step].desc}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {[0, 1, 2, 3].map((index) => (
            <Pressable 
              key={index} 
              onPress={() => handleStepChange(index)}
              hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }} 
              style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, padding: 8 }]}
            >
              <View style={[styles.dot, step === index && styles.activeDot]} />
            </Pressable>
          ))}
        </View>
        <Pressable 
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.9 : 1 }]} 
          onPress={() => handleStepChange(step + 1)}
        >
          <Text style={styles.buttonText}>{step === 3 ? "Başla" : "Devam Et"}</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
        </Pressable>
      </View>
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
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 25
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary
  },
  contentArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center'
  },
  mockupContainer: {
    alignItems: 'center',
    paddingBottom: 15
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 40
  },
  phoneMockupBackground: {
    width: width * 0.68,
    maxWidth: 260,
    height: 360,
    backgroundColor: COLORS.bgLight,
    borderRadius: 40,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  phoneMockupOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: COLORS.outline,
    justifyContent: 'flex-start',
    padding: 0
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 5
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 10
  },
  separator: {
    width: '80%',
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 4
  },
  cardContent: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark
  },
  closeIcon: {
    position: 'absolute',
    top: 12,
    right: 12
  },
  mockLineShort: {
    width: 35,
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  mockLineMedium: {
    width: 70,
    height: 7,
    backgroundColor: '#eef2ff',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  mockInput: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15
  },
  inputText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500'
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: COLORS.primary,
    marginLeft: 2
  },
  mockBox: {
    width: '100%',
    height: 35,
    backgroundColor: '#f8fafc',
    borderRadius: 10
  },
  fab: {
    position: 'absolute',
    right: -12,
    bottom: -15,
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6
  },
  lockScreenContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 15
  },
  lockDate: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 4,
    fontWeight: '500'
  },
  lockTime: {
    fontSize: 54,
    fontWeight: '300',
    color: COLORS.textDark,
    marginBottom: 25,
    letterSpacing: -2
  },
  notificationCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  notifIconWrapper: {
    width: 20,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  notifTimeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textGray
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 1
  },
  notifDesc: {
    fontSize: 13,
    color: COLORS.textGray
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 15,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 22
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 25
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.dotInactive,
    marginHorizontal: 2
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 22
  },
  button: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    width: '90%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  buttonIcon: {
    marginLeft: 8
  }
});