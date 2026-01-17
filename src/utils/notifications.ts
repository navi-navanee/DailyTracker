import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Permission not granted!');
    return false;
  }
  return true;
}

export async function scheduleReminder(id: string, hour: number, minute: number) {
  console.log(`Scheduling reminder for ${hour}:${minute}`);
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
      console.log('No permission to schedule');
      return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: "It's time for your habit!",
      body: 'Stay consistent with your goals.',
    },
    trigger: {
      type: 'daily',
      hour: hour,
      minute: minute,
      repeats: true,
    } as any,
  });
  return identifier;
}

export async function cancelReminder(identifier: string) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}
