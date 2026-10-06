'use server';

import { Task, TaskModel } from '@/models/task';
import { connectDb } from '@/utils/database';
import { redirect } from 'next/navigation';

export interface FormState {
    error: string;
}

export const createTask = async (state: FormState, formData: FormData) => {
    const newTask: Task = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        dueDate: formData.get('dueDate') as string,
        isCompleted: false,
        priority: formData.get('priority') as "高"|"中"|"低"
    }

    if (!newTask.title) {
        state.error = 'タスク名を入力してください。';
        return state;
    }

    if (newTask.dueDate < new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\//g, '-')) {
        state.error = '期限日は今日以降の日付を入力してください。';
        return state;
    }

    try {
        await connectDb()
        await TaskModel.create(newTask)
    } catch(error) {
        state.error = 'タスクの作成に失敗しました';
        console.log(error)
        return state;
    }

    redirect('/')
}

export const updateTask = async (id: string, state: FormState, formData: FormData) => {

    const updateTask: Task = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        dueDate: formData.get('dueDate') as string,
        isCompleted: Boolean(formData.get('isCompleted')),
        priority: formData.get('priority') as "高"|"中"|"低"
    }

    if (!updateTask.title) {
        state.error = 'タスク名を入力してください。';
        return state;
    }

    if (updateTask.dueDate < new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).replace(/\//g, '-')) {
        state.error = '期限日は今日以降の日付を入力してください。';
        return state;
    }

    try {
        await connectDb()
        await TaskModel.updateOne({_id: id}, updateTask)
    } catch(error) {
        state.error = 'タスクの更新に失敗しました';
        console.log(error)
        return state;
    } 

    redirect('/')
}

export const deleteTask = async (id: string, state: FormState) => {
    try {
        await connectDb()
        await TaskModel.deleteOne({_id: id})
    } catch(error) {
        state.error = 'タスクの削除に失敗しました';
        console.log(error)
        return state;
    } 

    redirect('/')
}