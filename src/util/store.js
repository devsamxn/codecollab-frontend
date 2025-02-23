import { create } from "zustand";

const useEditorStore = create((set) => ({
  code: "// Start coding...",
  language: "javascript",
  theme: "vs-dark",
  roomId: null,
  password: "",
  setRoomId: (roomId) => set({ roomId }),
  setPassword: (password) => set({ password }),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
}));

export default useEditorStore;
