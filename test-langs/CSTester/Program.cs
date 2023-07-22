using ADRaffy.ENSNormalize;
using System.Text.Json;
using System.Text.Json.Nodes;

string dir = Path.Combine(Environment.CurrentDirectory, "../../../../");

JsonArray recs = new();

foreach (JsonElement temp in JsonDocument.Parse(File.ReadAllText(Path.Combine(dir, "../ens-labels/labels.json"))).RootElement.EnumerateArray())
{
    JsonObject rec = new();
    try
    {
        string name = temp.GetString()!;
        string norm = ENSNormalize.ENSIP15.Normalize(name);
        if (norm != name)
        {
            rec["norm"] = norm;
        }
    }
    catch (InvalidLabelException err)
    {
        rec["error"] = err.InnerException!.Message ;
    }
    recs.Add(rec);
}

File.WriteAllText(Path.Combine(dir, "output/cs.json"), recs.ToJsonString(new JsonSerializerOptions { WriteIndented = false }));    
