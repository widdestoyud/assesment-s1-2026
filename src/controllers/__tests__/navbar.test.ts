import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NavbarController from '@controllers/navbar.controller.ts';
import type { LangData } from '@components/LangSelector';

describe('NavbarController', () => {
  // Mock data
  const mockImages = {
    icon: {
      idFlag: 'id-flag.png',
      enFlag: 'en-flag.png',
    },
  };

  // Mock dependencies
  const mockToggleLoading = vi.fn();
  const mockSetLng = vi.fn();
  const mockNavigate = vi.fn();
  const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
  const mockSetItem = vi.fn();
  const mockNormalizeLang = vi.fn(lang => lang.toLowerCase());
  const mockTranslation = vi.fn(() => ({
    i18n: {
      changeLanguage: mockChangeLanguage,
    },
  }));

  let mockLanguages: LangData[];
  const mockSetLanguages = vi.fn(newLngs => {
    mockLanguages = newLngs.map((language: any) => {
      return {
        ...language,
        active: mockSetLng.mock.calls[0][0] === language.name.toLowerCase(),
      };
    });
  });

  const mockLocalStorage = {
    setItem: mockSetItem,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset mock state
    mockLanguages = [
      {
        img: mockImages.icon.idFlag,
        name: 'ID',
        active: true,
      },
      {
        img: mockImages.icon.enFlag,
        name: 'EN',
        active: false,
      },
    ];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupController = (initialLng = 'id') => {
    mockNormalizeLang.mockImplementation(lang => lang.toLowerCase());

    return {
      controller: NavbarController({
        localStorage: mockLocalStorage,
        useTranslation: mockTranslation,
        helpers: {
          normalizeLang: mockNormalizeLang,
        },
        useState: vi.fn(initialValue => {
          if (Array.isArray(initialValue)) {
            return [
              mockLanguages.map(lng => ({
                ...lng,
                active: lng.name.toLowerCase() === initialLng,
              })),
              mockSetLanguages,
            ];
          }
          return [initialValue, vi.fn()];
        }),
        useLoading: vi.fn(() => ({
          toggleLoading: mockToggleLoading,
        })),
        useLng: vi.fn(() => ({
          lng: initialLng,
          setLng: mockSetLng,
        })),
        images: mockImages,
        useNavigation: () => ({
          navigate: mockNavigate,
        }),
      } as any),
    };
  };

  describe('initialization', () => {
    it('should return the correct interface', () => {
      const { controller } = setupController();

      expect(controller).toEqual({
        languages: expect.any(Array),
        onChangeLng: expect.any(Function),
        onHomeClick: expect.any(Function),
      });
    });

    it('should initialize languages with correct active state', () => {
      const { controller: enController } = setupController('en');
      expect(enController.languages[0].active).toBe(false);
      expect(enController.languages[1].active).toBe(true);

      const { controller } = setupController('id');
      expect(controller.languages[0].active).toBe(true);
      expect(controller.languages[1].active).toBe(false);
    });
  });

  describe('language handling', () => {
    it('should change language when onChangeLng is called with different language', async () => {
      const { controller } = setupController('id');

      await controller.onChangeLng('EN');

      expect(mockToggleLoading).toHaveBeenCalledTimes(1);
      // expect(mockSetItem).toHaveBeenCalledWith('i18nextLng', 'en');
      expect(mockSetLng).toHaveBeenCalledWith('en');

      // Fast-forward timers
      vi.advanceTimersByTime(300);

      expect(mockToggleLoading).toHaveBeenCalledTimes(2);
      expect(mockSetLanguages).toHaveBeenCalled();

      expect(mockLanguages[0].active).toBe(false);
      expect(mockLanguages[1].active).toBe(true);
    });

    it('should not change language when onChangeLng is called with same language', () => {
      const { controller } = setupController('id');

      controller.onChangeLng('ID');

      expect(mockToggleLoading).not.toHaveBeenCalled();
      expect(mockSetItem).not.toHaveBeenCalled();
      expect(mockSetLng).not.toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate to landing page on home click', () => {
      const { controller } = setupController();

      controller.onHomeClick();

      expect(mockNavigate).toHaveBeenCalledWith({
        to: 'landing-page',
        viewTransition: true,
      });
    });
  });
});
