
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


exmap graph obcommand graph:open
nmap <Space>og graph<CR>

exmap togglefileexplorer obcommand file-explorer:open 
nmap <C-j> :togglefileexplorer<CR>


exmap editorleft obcommand editor:focus-left 
nmap <C-h> :editorleft<CR>

exmap editorright obcommand editor:focus-right
nmap <C-l> :editorright<CR>
