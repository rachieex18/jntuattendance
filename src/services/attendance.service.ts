import { supabase } from './supabase';
import { SubjectType } from '../utils/attendance';

export const attendanceService = {
    async getSubjects(userId: string) {
        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        return data;
    },

    async addSubject(userId: string, name: string, type: SubjectType, code?: string) {
        const { data, error } = await supabase
            .from('subjects')
            .insert([{ user_id: userId, name, subject_type: type, code }])
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async markAttendance(userId: string, subjectId: string, status: 'Present' | 'Absent' | 'MidtermBonus', hours: number) {
        // 1. Log the attendance
        const { error: logError } = await supabase
            .from('attendance_logs')
            .insert([{
                user_id: userId,
                subject_id: subjectId,
                status,
                hours: status === 'Present' ? hours : 0 // Hours only count if present
            }]);

        if (logError) throw logError;

        // 2. Update subject totals
        const { data: subject, error: fetchError } = await supabase
            .from('subjects')
            .select('total_hours_conducted, total_hours_attended, midterm_bonus_hours')
            .eq('id', subjectId)
            .single();

        if (fetchError) throw fetchError;

        let updateData: any = {
            total_hours_conducted: subject.total_hours_conducted + hours
        };

        if (status === 'Present') {
            updateData.total_hours_attended = subject.total_hours_attended + hours;
        } else if (status === 'MidtermBonus') {
            updateData.midterm_bonus_hours = subject.midterm_bonus_hours + 2; // Fixed bonus
            updateData.total_hours_conducted = subject.total_hours_conducted; // Conducted doesn't increase for bonus? 
            // Actually, JNTUH bonus usually credits hours WITHOUT increasing conducted.
        }

        const { error: updateError } = await supabase
            .from('subjects')
            .update(updateData)
            .eq('id', subjectId);

        if (updateError) throw updateError;
    },

    async deleteSubject(subjectId: string) {
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', subjectId);
        if (error) throw error;
    }
};
