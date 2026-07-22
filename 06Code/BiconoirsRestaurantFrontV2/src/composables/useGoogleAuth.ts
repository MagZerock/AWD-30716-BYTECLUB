import { ref, onMounted, onUnmounted } from "vue";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export function useGoogleAuth(onCredential: (credential: string) => void) {
  const isReady = ref(false);
  const isScriptLoaded = ref(false);

  const initGoogle = () => {
    if (!window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        onCredential(response.credential);
      },
    });

    isReady.value = true;
  };

  const renderButton = (element: HTMLElement) => {
    if (!isReady.value || !window.google?.accounts?.id) return;

    window.google.accounts.id.renderButton(element, {
      theme: "outline",
      size: "large",
      width: element.offsetWidth || 300,
      text: "signin_with",
      shape: "pill",
      logo_alignment: "center",
    });
  };

  const checkScript = () => {
    if (window.google?.accounts?.id) {
      isScriptLoaded.value = true;
      initGoogle();
    }
  };

  onMounted(() => {
    if (window.google?.accounts?.id) {
      isScriptLoaded.value = true;
      initGoogle();
    } else {
      const interval = setInterval(checkScript, 100);
      const timeout = setTimeout(() => clearInterval(interval), 10000);
      onUnmounted(() => {
        clearInterval(interval);
        clearTimeout(timeout);
      });
    }
  });

  return { isReady, renderButton };
}
