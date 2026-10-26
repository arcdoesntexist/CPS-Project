using System;
using UnityEngine;

namespace CPS.KitchenCatch
{
    public sealed class AppSession : MonoBehaviour
    {
        public static AppSession Instance { get; private set; }
        public ProfileStore Store { get; private set; }
        public PlayerProfile SelectedProfile { get; private set; }
        public DifficultyId SelectedDifficulty { get; private set; } = DifficultyId.Easy;

        public void Initialize(ProfileStore store)
        {
            if (store == null) throw new ArgumentNullException(nameof(store));
            if (Store != null) throw new InvalidOperationException("AppSession is already initialized.");
            Store = store;
            Store.Load();
        }

        public void Select(string playerId, DifficultyId difficulty)
        {
            if (!Enum.IsDefined(typeof(DifficultyId), difficulty))
                throw new ArgumentException("Unknown difficulty.", nameof(difficulty));
            if (Store == null) throw new InvalidOperationException("AppSession is not initialized.");
            PlayerProfile selected = null;
            foreach (var profile in Store.Profiles)
                if (profile.PlayerId == playerId) { selected = profile; break; }
            if (selected == null) throw new ArgumentException("Unknown player ID.", nameof(playerId));
            SelectedProfile = selected;
            SelectedDifficulty = difficulty;
        }

        public void ClearSelection()
        {
            SelectedProfile = null;
        }

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);
            if (Store == null) Initialize(new ProfileStore());
        }

        private void OnDestroy()
        {
            if (Instance == this) Instance = null;
        }
    }
}
