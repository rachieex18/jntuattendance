import { CONFIG } from '../constants/Config';

export type SubjectType = 'Theory' | 'Lab';

export interface SubjectData {
    id: string;
    name: string;
    type: SubjectType;
    attendedHours: number;
    conductedHours: number;
    midtermBonus: number;
}

/**
 * Calculates the total attendance percentage for a subject.
 * Total Attended = (Hours Attended) + (Midterm Bonus)
 */
export const calculateSubjectPercentage = (subject: SubjectData): number => {
    const totalAttended = subject.attendedHours + subject.midtermBonus;
    if (subject.conductedHours === 0) return 100;
    return Math.min(100, (totalAttended / subject.conductedHours) * 100);
};

/**
 * Calculates how many more hours a student can skip while staying above a threshold.
 * Target can be 75 (Safe) or 65 (Condonation).
 */
export const calculateBunkCapacity = (subject: SubjectData, targetPercentage: number): number => {
    const totalAttended = subject.attendedHours + subject.midtermBonus;
    const currentPercentage = calculateSubjectPercentage(subject);

    if (currentPercentage < targetPercentage) return 0;

    // Formula: (Attended / (Conducted + Bunked)) >= Target/100
    // Attended * 100 / Target >= Conducted + Bunked
    // Bunked <= (Attended * 100 / Target) - Conducted

    const maxConductedForThreshold = Math.floor((totalAttended * 100) / targetPercentage);
    const bunkable = maxConductedForThreshold - subject.conductedHours;

    return Math.max(0, bunkable);
};

/**
 * Calculates how many more hours a student needs to reach a threshold.
 */
export const calculateRequiredHours = (subject: SubjectData, targetPercentage: number): number => {
    const totalAttended = subject.attendedHours + subject.midtermBonus;
    const currentPercentage = calculateSubjectPercentage(subject);

    if (currentPercentage >= targetPercentage) return 0;

    // Formula: (Attended + Needed) / (Conducted + Needed) >= Target/100
    // 100 * (Attended + Needed) >= Target * (Conducted + Needed)
    // 100 * Attended + 100 * Needed >= Target * Conducted + Target * Needed
    // (100 - Target) * Needed >= Target * Conducted - 100 * Attended
    // Needed >= (Target * Conducted - 100 * Attended) / (100 - Target)

    const needed = Math.ceil(
        (targetPercentage * subject.conductedHours - 100 * totalAttended) / (100 - targetPercentage)
    );

    return Math.max(0, needed);
};

export const getAttendanceStatus = (percentage: number) => {
    if (percentage >= CONFIG.JNTUH_RULES.SAFE_ZONE) {
        return { label: 'Safe Zone', color: '#22c55e', icon: '🟢' };
    }
    if (percentage >= CONFIG.JNTUH_RULES.CONDONATION_ZONE) {
        return { label: 'Condonation Risk', color: '#eab308', icon: '🟡' };
    }
    return { label: 'Detention Risk', color: '#ef4444', icon: '🔴' };
};

/**
 * Aggregate attendance calculation for all subjects.
 */
export const calculateAggregateAttendance = (subjects: SubjectData[]): number => {
    if (subjects.length === 0) return 0;

    let totalAttended = 0;
    let totalConducted = 0;

    subjects.forEach(sub => {
        totalAttended += (sub.attendedHours + sub.midtermBonus);
        totalConducted += sub.conductedHours;
    });

    if (totalConducted === 0) return 100;
    return Math.min(100, (totalAttended / totalConducted) * 100);
};
