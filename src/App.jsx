import { useState, useEffect } from "react";

const DATA = {
  genres: ["Mystery", "Thriller", "Science Fiction", "Fantasy", "Horror", "Comedy", "Romance", "Historical", "Adventure", "Western", "Crime", "Drama", "Young Adult", "Musical"],
  themes: ["Love and Romance", "Friendship", "Hero's Journey", "Good vs. Evil", "Identity and Self-Discovery", "Social Justice and Activism", "Loss and Grief", "Redemption", "Resilience and Perseverance", "Power and Corruption", "Injustice and Revenge", "Cultural Identity and Heritage", "Dreams and Ambitions", "Sacrifice and Duty"],
  settings: ["The Magical Realm", "The Dystopian Future", "The Historical Period", "The Isolated Island", "The Space Station", "The Small Town", "The Futuristic Megacity", "The Mysterious Mansion", "The Desert Wasteland", "The Dreamworld", "The College Campus", "The Seaside Village", "The Crime-Ridden Urban Underbelly", "The Carnival or Circus", "The Wild West Frontier", "The Tribal Village", "The Lost Civilization", "The Haunted Castle"],
  archetypes: ["The Hero", "The Mentor", "The Sidekick", "The Antihero", "The Villain", "The Love Interest", "The Trickster", "The Sage", "The Explorer", "The Rebel", "The Outlaw", "The Femme Fatale", "The Reluctant Hero", "The Elderly Mentor", "The Mercenary", "The Survivor", "The Double Agent", "The Everyman"],
  conflicts: ["External Antagonists", "Internal Struggles", "Interpersonal Conflict", "Societal Issues", "Betrayal and Deception", "Time Constraints", "Resource Scarcity", "Identity Crisis", "Moral and Ethical Dilemmas", "Cultural Clashes", "Supernatural Phenomena", "Legal and Political Obstacles", "Medical Challenges", "Existential Crisis"],
  plots: ["The Hero's Journey", "Overcoming the Monster", "Rags to Riches", "The Quest", "Voyage and Return", "Comedy", "Tragedy", "Rebirth", "The Mystery", "The Underdog", "Forbidden Love", "Escape", "Betrayal", "Coming of Age", "Survival", "Historical Drama", "Revenge", "Epic"],
  narration: ["First-Person Narration", "Third-Person Omniscient", "Epistolary (Letters/Diaries)", "Journalistic/Documentary", "Multiple Narrators", "Unreliable Narration", "Audio Diary/Journal Entries", "In-Media (News Broadcasts, Recordings)", "Radio Drama Style", "Non-Human Narration"],
};

const CATEGORIES = Object.keys(DATA);

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMultiple(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

const LABEL_MAP = {
  genres: "Genre", themes: "Themes", settings: "Setting",
  archetypes: "Character Archetypes", conflicts: "Conflict",
  plots: "Plot Structure", narration: "Narration Style",
};

const CHIP_COLORS = {
  genres: { bg: "#3d2a1a", border: "#c8793a", text: "#f4a96a" },
  themes: { bg: "#1a2a1a", border: "#5a9a5a", text: "#8fd48f" },
  settings: { bg: "#1a1a3a", border: "#4a6ac8", text: "#8aabf4" },
  archetypes: { bg: "#2a1a2a", border: "#9a4ac8", text: "#c88af4" },
  conflicts: { bg: "#2a1a1a", border: "#c84a4a", text: "#f48a8a" },
  plots: { bg: "#2a2a1a", border: "#c8b44a", text: "#f4d88a" },
  narration: { bg: "#1a2a2a", border: "#4ac8b4", text: "#8af4e4" },
};

export default function App() {
  const [selections, setSelections] = useState({
    genres: [], themes: [], settings: [],
    archetypes: [], conflicts: [], plots: [], narration: [],
  });
  const [vibe, setVibe] = useState("");
  const [pitch, setPitch] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState(""); // "saving" | "saved" | "error" | ""

  const SHEET_URL = "https://script.google.com/macros/s/AKfycbyCMhpoF1vZ1lWWhoai-essZgoUXLRiEBljwdIFaDQwFMBzj3lz-aM9f0Lfhsf3iSyt/exec";

  async function savePitch() {
    if (!pitch) return;
    setSaveStatus("saving");
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toLocaleString(),
          pitch,
          genre: selections.genres.join(", "),
          themes: selections.themes.join(", "),
          setting: selections.settings.join(", "),
          archetypes: selections.archetypes.join(", "),
          conflicts: selections.conflicts.join(", "),
          plot: selections.plots.join(", "),
          narration: selections.narration.join(", "),
          vibe: vibe || "",
        }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (e) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  }

  function randomizeAll() {
    setSelections({
      genres: [pick(DATA.genres)],
      themes: pickMultiple(DATA.themes, 2),
      settings: [pick(DATA.settings)],
      archetypes: pickMultiple(DATA.archetypes, 3),
      conflicts: pickMultiple(DATA.conflicts, 2),
      plots: [pick(DATA.plots)],
      narration: [pick(DATA.narration)],
    });
  }

  const NO_PREF = "No Preference";

  function toggleItem(cat, item) {
    setSelections(prev => {
      const cur = prev[cat];
      if (item === NO_PREF) {
        // toggle No Preference — clears other selections for that category
        if (cur.includes(NO_PREF)) return { ...prev, [cat]: [] };
        return { ...prev, [cat]: [NO_PREF] };
      }
      // selecting a real item clears No Preference
      const without = cur.filter(i => i !== NO_PREF);
      if (without.includes(item)) return { ...prev, [cat]: without.filter(i => i !== item) };
      return { ...prev, [cat]: [...without, item] };
    });
  }

  function clearAll() {
    setSelections({ genres: [], themes: [], settings: [], archetypes: [], conflicts: [], plots: [], narration: [] });
    setPitch("");
    setVibe("");
    setError("");
  }

  const totalSelected = Object.values(selections).flat().length;

  async function generatePitch() {
    setLoading(true);
    setPitch("");
    setError("");

    const selectionSummary = Object.entries(selections)
      .filter(([, v]) => v.length > 0)
      .map(([k, v]) => {
        if (v.includes(NO_PREF)) return `${LABEL_MAP[k]}: freestyle — surprise me`;
        return `${LABEL_MAP[k]}: ${v.join(", ")}`;
      })
      .join("\n");

    const vibeNote = vibe ? `\nCreator's vibe/mood note: "${vibe}"` : "";

    const prompt = `You are a creative developer for scripted fiction audio dramas and podcasts. 
    
Based on the following story elements, write a compelling short paragraph pitch (3-5 sentences) for an original audio drama concept. 

Where an element says "freestyle — surprise me", make a bold, unexpected choice for that element rather than defaulting to something generic.

The pitch should:
- Hook immediately with a vivid, specific premise
- Name or imply the protagonist and their core desire/wound
- Hint at the central conflict and emotional stakes
- Feel like a real production pitch — cinematic, specific, surprising
- Be written for audio drama (no visual descriptions)

Story Elements Selected:
${selectionSummary}${vibeNote}

Write ONLY the pitch paragraph. No title, no preamble, no labels.`;

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(`API error ${response.status}: ${JSON.stringify(data)}`);
        setLoading(false);
        return;
      }
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) {
        setError(`No text returned. Raw response: ${JSON.stringify(data)}`);
        setLoading(false);
        return;
      }
      setPitch(text.trim());
    } catch (e) {
      setError(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  const canGenerate = totalSelected >= 3 || (vibe.trim().length > 5 && activeTab === "vibe");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0c0a",
      color: "#e8dcc8",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #2a2218",
        padding: "32px 40px 24px",
        background: "linear-gradient(180deg, #1a1410 0%, #0e0c0a 100%)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            fontSize: 11,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#c8793a",
            marginBottom: 8,
            fontFamily: "monospace",
          }}>Project Manatee</div>
          <h1 style={{
            fontSize: 32,
            fontWeight: "normal",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            color: "#f4e8d0",
          }}>Story Idea Generator</h1>
          <p style={{ margin: "10px 0 0", color: "#8a7a64", fontSize: 14, fontStyle: "italic" }}>
            Mix elements to build your next audio drama pitch
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>
        {/* Mode Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 32, borderBottom: "1px solid #2a2218" }}>
          {[
            { id: "manual", label: "Pick Your Own" },
            { id: "shuffle", label: "Randomize" },
            { id: "vibe", label: "Vibe Match" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: "10px 20px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #c8793a" : "2px solid transparent",
              color: activeTab === tab.id ? "#f4a96a" : "#6a5a48",
              cursor: "pointer",
              fontSize: 13,
              letterSpacing: "0.05em",
              fontFamily: "monospace",
              textTransform: "uppercase",
              transition: "all 0.15s",
              marginBottom: -1,
            }}>{tab.label}</button>
          ))}
        </div>

        {/* SHUFFLE MODE */}
        {activeTab === "shuffle" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <p style={{ color: "#8a7a64", marginBottom: 32, fontSize: 15 }}>
              Claude picks a random combination of elements and generates a pitch from them.
            </p>
            <button onClick={() => { randomizeAll(); setActiveTab("manual"); }} style={{
              padding: "14px 36px",
              background: "#c8793a",
              color: "#0e0c0a",
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: "bold",
            }}>
              🎲 Randomize Elements
            </button>
            <p style={{ color: "#4a3a2a", fontSize: 12, marginTop: 16, fontStyle: "italic" }}>
              This will fill in selections — you can then edit them in "Pick Your Own"
            </p>
          </div>
        )}

        {/* VIBE MODE */}
        {activeTab === "vibe" && (
          <div style={{ padding: "8px 0 32px" }}>
            <label style={{ display: "block", color: "#8a7a64", fontSize: 13, marginBottom: 12, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Describe your vibe, mood, or a loose idea
            </label>
            <textarea
              value={vibe}
              onChange={e => setVibe(e.target.value)}
              placeholder={`e.g. "Something bittersweet, like a revenge story that turns into grief. Set somewhere isolated. Queer lead character."`}
              style={{
                width: "100%",
                minHeight: 120,
                background: "#1a1510",
                border: "1px solid #3a2e20",
                color: "#e8dcc8",
                padding: "16px",
                fontSize: 15,
                fontFamily: "Georgia, serif",
                resize: "vertical",
                lineHeight: 1.6,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <p style={{ color: "#4a3a2a", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
              Claude will match your vibe to elements from the doc and generate a pitch. You can also combine this with manual selections.
            </p>
          </div>
        )}

        {/* MANUAL / DISPLAY MODE — always show selections */}
        {activeTab === "manual" && (
          <div>
            {CATEGORIES.map(cat => (
              <div key={cat} style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: CHIP_COLORS[cat].text,
                  marginBottom: 10,
                  fontFamily: "monospace",
                  opacity: 0.8,
                }}>
                  {LABEL_MAP[cat]}
                  {selections[cat].length > 0 && (
                    <span style={{ color: "#4a3a2a", marginLeft: 8 }}>({selections[cat].length} selected)</span>
                  )}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {/* No Preference chip */}
                  {(() => {
                    const sel = selections[cat].includes(NO_PREF);
                    return (
                      <button
                        key="no-pref"
                        onClick={() => toggleItem(cat, NO_PREF)}
                        style={{
                          padding: "5px 12px",
                          fontSize: 12,
                          background: sel ? "#2a2218" : "transparent",
                          border: `1px dashed ${sel ? "#8a7a64" : "#3a3228"}`,
                          color: sel ? "#c8b878" : "#4a3a28",
                          cursor: "pointer",
                          borderRadius: 2,
                          transition: "all 0.12s",
                          fontFamily: "monospace",
                          fontStyle: "italic",
                        }}
                      >✦ No Preference</button>
                    );
                  })()}
                  {DATA[cat].map(item => {
                    const sel = selections[cat].includes(item);
                    const c = CHIP_COLORS[cat];
                    return (
                      <button
                        key={item}
                        onClick={() => toggleItem(cat, item)}
                        style={{
                          padding: "5px 12px",
                          fontSize: 12,
                          background: sel ? c.bg : "transparent",
                          border: `1px solid ${sel ? c.border : "#2a2218"}`,
                          color: sel ? c.text : "#5a4a38",
                          cursor: "pointer",
                          borderRadius: 2,
                          transition: "all 0.12s",
                          fontFamily: "Georgia, serif",
                        }}
                      >{item}</button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Summary (always visible when not in manual) */}
        {activeTab !== "manual" && totalSelected > 0 && (
          <div style={{
            background: "#1a1510",
            border: "1px solid #2a2218",
            padding: "16px 20px",
            marginBottom: 24,
          }}>
            <div style={{ fontSize: 11, color: "#6a5a48", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 10 }}>
              Current Selections
            </div>
            {Object.entries(selections).filter(([, v]) => v.length > 0).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 6, fontSize: 13 }}>
                <span style={{ color: "#6a5a48", fontFamily: "monospace", marginRight: 8 }}>{LABEL_MAP[k]}:</span>
                <span style={{ color: "#c8a878" }}>{v.join(" · ")}</span>
              </div>
            ))}
          </div>
        )}

        {/* Generate Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "24px 0",
          borderTop: "1px solid #2a2218",
          marginTop: activeTab === "manual" ? 8 : 0,
        }}>
          <button
            onClick={generatePitch}
            disabled={!canGenerate || loading}
            style={{
              padding: "13px 32px",
              background: canGenerate && !loading ? "#c8793a" : "#2a2218",
              color: canGenerate && !loading ? "#0e0c0a" : "#4a3a2a",
              border: "none",
              cursor: canGenerate && !loading ? "pointer" : "not-allowed",
              fontSize: 13,
              fontFamily: "monospace",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: "bold",
              transition: "all 0.15s",
            }}
          >
            {loading ? "Writing..." : "Generate Pitch"}
          </button>

          {totalSelected > 0 && (
            <button onClick={clearAll} style={{
              padding: "13px 20px",
              background: "transparent",
              color: "#4a3a2a",
              border: "1px solid #2a2218",
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Clear All
            </button>
          )}

          {!canGenerate && !loading && (
            <span style={{ color: "#4a3a2a", fontSize: 12, fontStyle: "italic" }}>
              {activeTab === "vibe" ? "Add a vibe note to generate" : "Select at least 3 elements to generate"}
            </span>
          )}
          {totalSelected > 0 && (
            <span style={{ color: "#4a3a2a", fontSize: 12, marginLeft: "auto", fontFamily: "monospace" }}>
              {totalSelected} element{totalSelected !== 1 ? "s" : ""} selected
            </span>
          )}
        </div>

        {/* Pitch Output */}
        {error && (
          <div style={{ color: "#f48a8a", padding: "16px", border: "1px solid #4a1a1a", background: "#1a0a0a", fontSize: 14 }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{
            padding: "40px",
            textAlign: "center",
            color: "#4a3a2a",
            fontStyle: "italic",
            fontSize: 14,
            letterSpacing: "0.05em",
          }}>
            <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
              Drafting your pitch...
            </span>
            <style>{`@keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }`}</style>
          </div>
        )}

        {pitch && !loading && (
          <div style={{
            padding: "32px 36px",
            background: "#13110e",
            borderLeft: "3px solid #c8793a",
            marginTop: 8,
            position: "relative",
          }}>
            <div style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c8793a",
              fontFamily: "monospace",
              marginBottom: 16,
              opacity: 0.7,
            }}>Generated Pitch</div>
            <p style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "#e8dcc8",
              margin: 0,
              fontStyle: "italic",
            }}>{pitch}</p>

            {/* Selected elements summary */}
            {totalSelected > 0 && (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #2a2218" }}>
                <div style={{ fontSize: 11, color: "#4a3a2a", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
                  Elements used
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {Object.entries(selections).flatMap(([k, v]) =>
                    v.map(item => (
                      <span key={`${k}-${item}`} style={{
                        padding: "3px 8px",
                        fontSize: 11,
                        background: item === NO_PREF ? "#2a2218" : CHIP_COLORS[k].bg,
                        color: item === NO_PREF ? "#c8b878" : CHIP_COLORS[k].text,
                        border: `1px ${item === NO_PREF ? "dashed #8a7a64" : `solid ${CHIP_COLORS[k].border}`}`,
                        opacity: 0.8,
                        fontStyle: item === NO_PREF ? "italic" : "normal",
                      }}>{item === NO_PREF ? `✦ ${LABEL_MAP[k]}: freestyle` : item}</span>
                    ))
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20, alignItems: "center" }}>
              <button onClick={generatePitch} style={{ padding: "8px 18px", background: "transparent", color: "#8a7a64", border: "1px solid #2a2218", cursor: "pointer", fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                ↺ Regenerate
              </button>
              <button
                onClick={savePitch}
                disabled={saveStatus === "saving"}
                style={{
                  padding: "8px 18px",
                  background: saveStatus === "saved" ? "#1a2a1a" : "#1a1a2a",
                  color: saveStatus === "saved" ? "#8fd48f" : saveStatus === "error" ? "#f48a8a" : "#8aabf4",
                  border: `1px solid ${saveStatus === "saved" ? "#5a9a5a" : saveStatus === "error" ? "#c84a4a" : "#4a6ac8"}`,
                  cursor: saveStatus === "saving" ? "not-allowed" : "pointer",
                  fontSize: 11, fontFamily: "monospace", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s",
                }}
              >
                {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Saved to Sheet" : saveStatus === "error" ? "✗ Save Failed" : "↗ Save to Sheet"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
