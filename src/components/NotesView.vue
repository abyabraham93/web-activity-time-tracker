<template>
  <div class="notes-container">
    <h3>Quick Notes</h3>
    <textarea 
      v-model="notes" 
      class="notes-textarea" 
      placeholder="Write your notes here..."
      @input="saveNotes"
    ></textarea>
    <div class="notes-actions">
      <button class="clear-button" @click="clearNotes">Clear Notes</button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'NotesView',
};
</script>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Browser from 'webextension-polyfill';

const { t } = useI18n();
const notes = ref<string>('');

// Storage key for notes
const NOTES_STORAGE_KEY = 'user_notes_content';

onMounted(async () => {
  // Load saved notes from storage
  try {
    const result = await Browser.storage.local.get(NOTES_STORAGE_KEY);
    if (result[NOTES_STORAGE_KEY]) {
      notes.value = result[NOTES_STORAGE_KEY];
    }
  } catch (error) {
    console.error('Error loading notes:', error);
  }
});

// Save notes to storage
async function saveNotes() {
  try {
    await Browser.storage.local.set({ [NOTES_STORAGE_KEY]: notes.value });
  } catch (error) {
    console.error('Error saving notes:', error);
  }
}

// Clear notes
async function clearNotes() {
  notes.value = '';
  try {
    await Browser.storage.local.set({ [NOTES_STORAGE_KEY]: '' });
  } catch (error) {
    console.error('Error clearing notes:', error);
  }
}
</script>

<style scoped>
.notes-container {
  width: 100%;
  max-width: 800px;
  margin: 0;
  padding: 10px;
}

.notes-textarea {
  width: 100%;
  min-height: 300px;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.notes-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.clear-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: #c0392b;
}
</style>
