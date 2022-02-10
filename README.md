# kakashi

简单无聊图搬运~

ffmpeg -loop 1 -t 31 -i long.jpg -filter_complex "color=white:s=750x1080,fps=fps=60[bg];[bg][0]overlay=y=-'t\*120':shortest=1[video]" -r 200/1 -preset ultrafast -map[video] -y "long.mp4"

ffmpeg
-loop 1
-t 31
-i long.jpg
-filter_complex
"
color=white:s=750x1080,fps=fps=60[bg];
[bg][0]overlay=y=-'t\*120':shortest=1[video]
"
-r 200/1 -preset ultrafast
-map[video]
-y "long.mp4"

ffmpeg -f lavfi -i color=s=750x1080 -loop 1 -t 0.1 -i "long.jpg" -filter_complex "[1:v]scale=750:-2,setpts=if(eq(N\,0)\,0\,1+1/0.02/TB),fps=60[fg];[0:v][fg]overlay=y=-'t*h*0.02':eof_action=endall[v]" -map "[v]" output.mp4

ffmpeg
-f lavfi
-i color=s=1920x1080 -loop 1 -t 0.08
-i "input.png"
-filter_complex
"
[1:v]scale=1920:-2,setpts=if(eq(N\,0)\,0\,1+1/0.02/TB),fps=25[fg];
[0:v][fg]overlay=y=-'t*h*0.02':eof_action=endall[v]
"
-map "[v]" output.mp4

ffmpeg
-i input.mp4
-i image1.png
-i image2.png
-filter_complex
[1:v]scale=100:100[img1];
[2:v]scale=1280:720[img2];
[0:v][img1]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[bkg];
[bkg][img2]overlay=0:0
-y output.mp4
