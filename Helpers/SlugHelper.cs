using System.Text.RegularExpressions;

namespace PAPI.Helpers 
{
    public static class SlugHelper
    {
        public static string GenerateSlug(string phrase)
        {
            if (string.IsNullOrEmpty(phrase))
            {
                return string.Empty;
            }

            string str = phrase.ToLowerInvariant();

            str = str.Replace("č", "c").Replace("ć", "c").Replace("š", "s").Replace("đ", "d").Replace("ž", "z");
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = Regex.Replace(str, @"\s", "-");
            str = Regex.Replace(str, @"-+", "-");

            return str;
        }
    }
}