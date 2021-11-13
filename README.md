# bd-1
 node.js bot for discord

<p>
    <b>Seznam všech použitelných příkazů bota</b>


    !ping - odpoví klasickým pong! </ br>
    !recept - odepíše náhodný recept na kávu</ br>
    !hra - zahrajte si s botem kámen-nůžky-papír


    <b>Pro moderátory</b>
    !clear X - smaže X posledních přízpěvků
    !ytb <ID discord kanálu, kam postovat novinky> <ID youtube kanálu> <ID role, kterou chceme pingnout v přízpěvku>
</p>


## Instalation

- for good run you need to have installed TMUX
- edit file ```./bd1-startup``` to right path to bot
- copy file ```./bd1-startup``` into ```~/bin/```
- make it runable: ```$ sudo chmod +x ~/bin/bd1-startup```
- open crontab ```$ crontab -e```
- add to last line ```@reboot sleep 10 && ~/bin/bd1-startup```, dont forget one blank line at the end
- this will start tmux with our bot running after each reboot
