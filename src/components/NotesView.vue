<template>
  <div class="notes-container">
    <h3>{{ t('notes_title') }}</h3>
    <textarea 
      v-model="notes" 
      class="notes-textarea" 
      :placeholder="t('notes_placeholder')"
      @input="saveNotes"
    ></textarea>
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
</script>

<style scoped>
.notes-container {
  width: 100%;
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
</style>
