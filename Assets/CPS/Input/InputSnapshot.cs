namespace CPS.KitchenCatch
{
    public readonly struct HandInput
    {
        public bool Pressed { get; }
        public float Strength01 { get; }
        public bool Valid { get; }
        public float? ForceN { get; }

        public HandInput(bool pressed, float strength01, bool valid, float? forceN)
        {
            Pressed = pressed;
            Strength01 = strength01;
            Valid = valid;
            ForceN = forceN;
        }
    }

    public readonly struct InputSnapshot
    {
        public HandInput Left { get; }
        public HandInput Right { get; }
        public string Source { get; }

        public InputSnapshot(HandInput left, HandInput right, string source)
        {
            Left = left;
            Right = right;
            Source = source;
        }
    }
}
