import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Uygulama açıkken de bildirimlerin ekranda görünmesini sağlar
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, 
    shouldShowList: true,   
  }),
});

// Art arda aynı kelimenin gelmesini engelleyen özel karıştırma (shuffle) algoritması
const shuffleWords = (wordsArray: any[]) => {
  let array = [...wordsArray];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// 1. ANA PLANLAYICI FONKSİYON
export const scheduleEchoNotifications = async (intervalHours: number, isEnabled: boolean) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!isEnabled) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Bildirim izni verilmedi!');
    return;
  }

  const storedWords = await AsyncStorage.getItem('@echoword_data');
  if (!storedWords) return;
  
  let words = JSON.parse(storedWords);
  if (words.length === 0) return;

  const daysToSchedule = 5; 
  const notificationsPerDay = Math.floor(24 / intervalHours);
  const totalNotifications = daysToSchedule * notificationsPerDay;

  let notificationQueue: any[] = [];
  let currentShuffledWords = shuffleWords(words);

  for (let i = 0; i < totalNotifications; i++) {
    if (currentShuffledWords.length === 0) {
      let nextShuffle = shuffleWords(words);
      if (notificationQueue.length > 0 && nextShuffle[0].id === notificationQueue[notificationQueue.length - 1].id) {
        const firstWord = nextShuffle.shift();
        nextShuffle.push(firstWord);
      }
      currentShuffledWords = nextShuffle;
    }
    notificationQueue.push(currentShuffledWords.shift());
  }

  let currentTime = new Date();

  for (let i = 0; i < notificationQueue.length; i++) {
    const word = notificationQueue[i];
    
    currentTime = new Date(currentTime.getTime() + intervalHours * 60 * 60 * 1000);

    let currentHour = currentTime.getHours();
    
    // Gece 23:00 veya sonrasıysa ertesi sabah 09:00'a at
    if (currentHour >= 23) {
      currentTime.setDate(currentTime.getDate() + 1);
      currentTime.setHours(9, 0, 0, 0);
    } 
    // Gece yarısını geçmiş ve 09:00'dan önceyse aynı sabah 09:00'a at
    else if (currentHour < 9) {
      currentTime.setHours(9, 0, 0, 0);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `EchoWord: ${word.kelime}`, 
        body: word.anlam,                  
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: currentTime,
      },
    });
  }

  console.log(`${totalNotifications} adet fısıltı gece filtresiyle planlandı!`);
};

// 2. YENİLEYİCİ FONKSİYON (Hata aldığın yer burasıydı, artık export ediliyor)
export const refreshNotifications = async () => {
  try {
    const savedStatus = await AsyncStorage.getItem('@echoword_notif_status');
    const savedRange = await AsyncStorage.getItem('@echoword_notif_range');

    const isEnabled = savedStatus === null || savedStatus === 'true'; // Varsayılan açık
    const intervalHours = savedRange ? parseInt(savedRange, 10) : 4; // Varsayılan 4 saat

    if (isEnabled) {
      await scheduleEchoNotifications(intervalHours, isEnabled);
      console.log("Kelime listesi değişti, fısıltılar arka planda güncellendi! 🔄");
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (error) {
    console.error("Bildirimler yenilenirken hata oluştu:", error);
  }
};