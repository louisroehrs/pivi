pivi
====

Video download manager and web remote controlled playback (iPhone, iPad)  for raspberry pi. 
See our site at https://louisroehrs.github.io/pivi.

Install youtube-dl:
$ sudo curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
$ sudo chmod a+rx /usr/local/bin/youtube-dl

Omxplayer commands:  https://elinux.org/Omxplayer

1           decrease speed
2           increase speed
<           rewind
>           fast forward
z           show info
j           previous audio stream
k           next audio stream
i           previous chapter
o           next chapter
n           previous subtitle stream
m           next subtitle stream
s           toggle subtitles
w           show subtitles
x           hide subtitles
d           decrease subtitle delay (- 250 ms)
f           increase subtitle delay (+ 250 ms)
q           exit omxplayer
p / space   pause/resume
-           decrease volume
+ / =       increase volume
left arrow  seek -30 seconds
right arrow seek +30 seconds
down arrow  seek -600 seconds
up arrow    seek +600 seconds