#!/usr/bin/env bash
# Turns the raw screen recording into the landing-page demo video.
#
#   scripts/make-demo-video.sh ../demo2.mov frontend/public/demo docs/demo.gif
#
# Crops away the browser chrome (the recording shows localhost), speeds up the
# slow parts, adds a caption per step and an outro card, then writes a small
# web-ready MP4 plus a poster image. With a third argument it also writes a
# 2.5x looping GIF for the GitHub README, which can't play a repo MP4 inline.
#
# The crop and cut points below are for the 2026-11-08 recording (demo2.mov,
# 1:42, 3164x1942 Retina, production site, travel-time preferences). The
# 2026-10 cut is in git history. A new recording needs new values: run the
# storyboard command at the bottom and read them off the contact sheet.
set -euo pipefail

IN=${1:?usage: make-demo-video.sh <input> <output-dir> [readme.gif]}
OUT_DIR=${2:?usage: make-demo-video.sh <input> <output-dir> [readme.gif]}
GIF_OUT=${3:-}
FONT=${FONT:-/System/Library/Fonts/Supplemental/Arial Bold.ttf}
FONT_REG=${FONT_REG:-/System/Library/Fonts/Supplemental/Arial.ttf}

# The page area inside the recorded browser window, cut to 16:9 around the
# centred content (the page is wider than 16:9, so the empty sides go).
CROP="crop=2608:1466:278:322"
# Captions sit in a strip above the picture rather than on top of it, so they
# never hide the UI, and the player's controls (bottom edge) never hide them.
W=1280; PIC_H=720; BAND=80; H=$((PIC_H + BAND)); FPS=30

# start end speed caption [badge]
SEGMENTS=(
  "0|4|1.5|ItineraryAI · group trips planned from everyone's preferences|"
  "4|19|2.2|1  Create a trip: days there, and when to leave and come back|"
  "19|21|1|2  Share one survey link with your group|"
  "21.5|44|2.5|3  Everyone picks vibe, food, stay, budget and dealbreakers|"
  "46|50.5|1.5|4  Responses come in, then hit Generate|"
  "50.5|72.5|6|5  The AI agent researches, drafts and reviews its own plan|6x speed"
  "72.5|102|2.2|6  Overnight bus out, 3 days in Manali, back by morning|"
)
OUTRO_SECONDS=3

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
mkdir -p "$OUT_DIR"

filter=""
labels=""
i=0
for seg in "${SEGMENTS[@]}"; do
  IFS='|' read -r start end speed caption badge <<<"$seg"
  # Text goes through files so quotes, commas and colons need no escaping.
  printf '%s' "$caption" >"$WORK/cap$i.txt"
  chain="[0:v]trim=start=$start:end=$end,setpts=(PTS-STARTPTS)/$speed,fps=$FPS,$CROP,scale=$W:$PIC_H:flags=lanczos,setsar=1"
  chain+=",pad=$W:$H:0:$BAND:color=0x0c0a09"
  chain+=",drawtext=fontfile='$FONT':textfile='$WORK/cap$i.txt':fontsize=28:fontcolor=white"
  chain+=":x=(w-text_w)/2:y=($BAND-text_h)/2:alpha='min(1,t/0.35)'"
  if [ -n "$badge" ]; then
    printf '%s' "$badge" >"$WORK/badge$i.txt"
    chain+=",drawtext=fontfile='$FONT':textfile='$WORK/badge$i.txt':fontsize=22:fontcolor=0x0c0a09"
    chain+=":box=1:boxcolor=0xf59e0b@0.95:boxborderw=10:x=w-text_w-28:y=($BAND-text_h)/2"
  fi
  filter+="$chain[s$i];"
  labels+="[s$i]"
  i=$((i + 1))
done

printf '%s' "Plan your next group trip" >"$WORK/outro1.txt"
printf '%s' "itineraryai.in" >"$WORK/outro2.txt"
filter+="color=c=0x0c0a09:s=${W}x${H}:d=$OUTRO_SECONDS:r=$FPS,setsar=1"
filter+=",drawtext=fontfile='$FONT':textfile='$WORK/outro1.txt':fontsize=54:fontcolor=white:x=(w-text_w)/2:y=h/2-70:alpha='min(1,t/0.5)'"
filter+=",drawtext=fontfile='$FONT_REG':textfile='$WORK/outro2.txt':fontsize=40:fontcolor=0xf59e0b:x=(w-text_w)/2:y=h/2+10:alpha='min(1,t/0.5)'[outro];"
labels+="[outro]"
filter+="${labels}concat=n=$((i + 1)):v=1:a=0,fade=t=in:st=0:d=0.4[v]"

ffmpeg -v error -y -i "$IN" -filter_complex "$filter" -map "[v]" -an \
  -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p \
  -movflags +faststart "$OUT_DIR/itineraryai-demo.mp4"

# Poster: a frame from the finished itinerary, so the page shows the payoff before anyone hits play.
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT_DIR/itineraryai-demo.mp4")
POSTER_AT=$(python3 -c "print(max(0, $DUR - $OUTRO_SECONDS - 13))")
ffmpeg -v error -y -ss "$POSTER_AT" -i "$OUT_DIR/itineraryai-demo.mp4" -frames:v 1 -q:v 4 "$OUT_DIR/itineraryai-demo-poster.jpg"

if [ -n "$GIF_OUT" ]; then
  # 880px is the widest a README image displays at; 128 colours keeps it ~3 MB.
  mkdir -p "$(dirname "$GIF_OUT")"
  ffmpeg -v error -y -i "$OUT_DIR/itineraryai-demo.mp4" \
    -vf "setpts=PTS/2.5,fps=10,scale=880:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
    -loop 0 "$GIF_OUT"
  ls -lh "$GIF_OUT"
fi

ls -lh "$OUT_DIR"
echo "duration: ${DUR}s"

# Storyboard of a new recording (one frame every 3s, timestamped):
#   ffmpeg -i in.mp4 -vf "fps=1/3,scale=480:-2,drawtext=fontfile='$FONT':text='%{pts\:hms}':fontsize=22:fontcolor=yellow:box=1:boxcolor=black,tile=4x7" sheet_%d.png
