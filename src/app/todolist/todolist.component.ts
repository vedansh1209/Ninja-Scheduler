import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { saveAs } from 'file-saver';

interface Task {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  status: 'to-do' | 'in-progress' | 'completed';
  isCompleted: boolean;
}

@Component({
  selector: 'app-todolist',
  templateUrl: './todolist.component.html',
  styleUrls: ['./todolist.component.css']
})
export class TodolistComponent implements OnInit {
  taskArray: Task[] = [
    {
      title: 'Brush teeth',
      description: 'Morning routine',
      priority: 'low',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'to-do',
      isCompleted: false
    }
  ];
  sortedTaskArray: Task[] = [...this.taskArray];
  historyLog: string[] = [];
  sortField = 'dueDate';

  isEditModalOpen = false;
  editTaskIndex: number | null = null;
  editTaskData: Task = {
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
    status: 'to-do',
    isCompleted: false
  };

  constructor() { }

  ngOnInit(): void {
    this.sortTasks();
  }

  onSubmit(form: NgForm) {
    const newTask: Task = {
      title: form.controls['title'].value,
      description: form.controls['description'].value,
      priority: form.controls['priority'].value,
      dueDate: form.controls['dueDate'].value,
      status: 'to-do',
      isCompleted: false
    };
    this.taskArray.push(newTask);
    this.historyLog.push(`Task created: ${newTask.title} - ${newTask.description} - ${newTask.priority} - ${newTask.dueDate}`);
    this.sortTasks();
    form.reset();
  }

  onDelete(index: number) {
    this.historyLog.push(`Task deleted: ${this.taskArray[index].title}`);
    this.taskArray.splice(index, 1);
    this.sortTasks();
  }

  editTask(index: number) {
    this.editTaskIndex = index;
    this.editTaskData = { ...this.taskArray[index] };
    this.isEditModalOpen = true;
  }

  onEditSubmit(form: NgForm) {
    if (this.editTaskIndex !== null) {
      this.taskArray[this.editTaskIndex] = { ...this.editTaskData };
      this.historyLog.push(`Task edited: ${this.editTaskData.title}`);
      this.sortTasks();
      this.closeEditModal();
    }
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editTaskIndex = null;
    this.editTaskData = {
      title: '',
      description: '',
      priority: 'low',
      dueDate: '',
      status: 'to-do',
      isCompleted: false
    };
  }

  onStatusChange(index: number, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const status = selectElement.value as 'to-do' | 'in-progress' | 'completed';
    this.taskArray[index].status = status;
    this.historyLog.push(`Task status changed: ${this.taskArray[index].title} to ${status}`);
    this.sortTasks();
  }

  onSortChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.sortField = selectElement.value;
    this.sortTasks();
  }

  sortTasks() {
    this.sortedTaskArray = [...this.taskArray].sort((a, b) => {
      if (this.sortField === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (this.sortField === 'priority') {
        const priorityOrder: { [key in Task['priority']]: number } = { low: 1, medium: 2, high: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (this.sortField === 'status') {
        const statusOrder: { [key in Task['status']]: number } = { 'to-do': 1, 'in-progress': 2, 'completed': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });
  }

  exportToCSV() {
    const csvArray = this.sortedTaskArray.map(task => {
      return {
        Title: task.title,
        Description: task.description,
        Priority: task.priority,
        DueDate: task.dueDate,
        Status: task.status
      };
    });

    const csvContent = this.convertToCSV(csvArray);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'tasks.csv');
  }

  convertToCSV(objArray: any[]) {
    const keys = Object.keys(objArray[0]);
    const rows = objArray.map(obj => keys.map(key => obj[key]).join(',')).join('\n');
    return `${keys.join(',')}\n${rows}`;
  }
}
