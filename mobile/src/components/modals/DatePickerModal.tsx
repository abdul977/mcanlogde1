/**
 * Date Picker Modal Component
 * 
 * A modal component that provides a calendar interface for date selection
 * with accessibility features and proper validation.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';
import { AnimatedButton } from '../ui/AnimatedButton';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate?: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  title?: string;
  mode?: 'date' | 'time' | 'datetime';
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  selectedDate = new Date(),
  minimumDate,
  maximumDate,
  onDateSelect,
  onClose,
  title = 'Select Date',
  mode = 'date',
}) => {
  const [tempDate, setTempDate] = useState(selectedDate);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'set' && date) {
        onDateSelect(date);
        onClose();
      } else if (event.type === 'dismissed') {
        onClose();
      }
    } else {
      if (date) {
        setTempDate(date);
      }
    }
  };

  const handleConfirm = () => {
    onDateSelect(tempDate);
    onClose();
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (Platform.OS === 'android') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <DateTimePicker
          value={selectedDate}
          mode={mode}
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleDateChange}
        />
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <Text style={styles.title}>{title}</Text>
              
              <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                <Text style={styles.confirmText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Date Display */}
            <View style={styles.selectedDateContainer}>
              <Text style={styles.selectedDateText}>
                {formatDate(tempDate)}
              </Text>
            </View>

            {/* Date Picker */}
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={handleDateChange}
                textColor={COLORS.TEXT_PRIMARY}
                themeVariant="light"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <AnimatedButton
                title="Cancel"
                onPress={handleCancel}
                variant="secondary"
                size="medium"
                style={styles.button}
              />
              <AnimatedButton
                title="Select Date"
                onPress={handleConfirm}
                variant="primary"
                size="medium"
                style={styles.button}
                leftIcon="calendar-outline"
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: BORDER_RADIUS.XL,
    borderTopRightRadius: BORDER_RADIUS.XL,
    paddingBottom: SPACING.XL,
    ...SHADOWS.LG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_200,
  },
  cancelButton: {
    padding: SPACING.SM,
  },
  cancelText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    color: COLORS.TEXT_SECONDARY,
  },
  title: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.TEXT_PRIMARY,
  },
  confirmButton: {
    padding: SPACING.SM,
  },
  confirmText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.BASE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.SEMIBOLD as any,
    color: COLORS.PRIMARY,
  },
  selectedDateContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: COLORS.GRAY_50,
    marginHorizontal: SPACING.LG,
    marginTop: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  selectedDateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LG,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM as any,
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  pickerContainer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.LG,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.LG,
    gap: SPACING.MD,
  },
  button: {
    flex: 1,
  },
});

export default DatePickerModal;
