
nmap j gj
nmap k gk

set clipboard=unnamed

exmap back obcommand app:go-back
nmap <C-o> :back<CR>
exmap forward obcommand app:go-forward
nmap <C-i> :forward<CR>

exmap followLinkUnderCursor obcommand editor:follow-link
nmap gd :followLinkUnderCursor<CR>

exmap format obcommand obsidian-plugin-prettier:format-note
nmap gf :format<CR>

exmap toggleleft obcommand app:toggle-left-sidebar
nmap <C-n> :toggleleft<CR>

exmap focusexplorer obcommand file-explorer:reveal-active-file 
nmap <C-h> :focusexplorer<CR>

exmap editorfocus obcommand editor:focus
nmap <C-l> :editorfocus<CR>
