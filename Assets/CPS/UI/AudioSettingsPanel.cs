using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;

namespace CPS.KitchenCatch
{
    public sealed class AudioSettingsPanel : MonoBehaviour
    {
        [SerializeField] private Slider volumeSlider;
        [SerializeField] private Toggle backgroundMusicToggle;
        [SerializeField] private Text volumeValue;
        [SerializeField] private Button closeButton;
        private GameObject previousSelection;

        public void Show()
        {
            previousSelection = EventSystem.current?.currentSelectedGameObject;
            gameObject.SetActive(true);
        }

        private void OnEnable()
        {
            if (volumeSlider != null)
            {
                volumeSlider.minValue = 0;
                volumeSlider.maxValue = 1;
                volumeSlider.SetValueWithoutNotify(GlobalAudioSettings.MasterVolume);
                volumeSlider.onValueChanged.AddListener(SetVolume);
            }
            if (backgroundMusicToggle != null)
            {
                backgroundMusicToggle.SetIsOnWithoutNotify(GlobalAudioSettings.BackgroundMusicEnabled);
                backgroundMusicToggle.onValueChanged.AddListener(GlobalAudioSettings.SetBackgroundMusicEnabled);
            }
            if (closeButton != null) closeButton.onClick.AddListener(Hide);
            RefreshValue();
            var focus = volumeSlider != null ? volumeSlider.gameObject :
                backgroundMusicToggle != null ? backgroundMusicToggle.gameObject : closeButton?.gameObject;
            if (focus != null && EventSystem.current != null) EventSystem.current.SetSelectedGameObject(focus);
        }

        private void OnDisable()
        {
            if (volumeSlider != null) volumeSlider.onValueChanged.RemoveListener(SetVolume);
            if (backgroundMusicToggle != null)
                backgroundMusicToggle.onValueChanged.RemoveListener(GlobalAudioSettings.SetBackgroundMusicEnabled);
            if (closeButton != null) closeButton.onClick.RemoveListener(Hide);
        }

        private void SetVolume(float value)
        {
            GlobalAudioSettings.SetMasterVolume(value);
            RefreshValue();
        }

        private void RefreshValue()
        {
            if (volumeValue != null) volumeValue.text = Mathf.RoundToInt(GlobalAudioSettings.MasterVolume * 100).ToString();
        }

        private void Hide()
        {
            var restore = previousSelection;
            gameObject.SetActive(false);
            if (restore != null && restore.activeInHierarchy && EventSystem.current != null)
                EventSystem.current.SetSelectedGameObject(restore);
        }
    }
}
