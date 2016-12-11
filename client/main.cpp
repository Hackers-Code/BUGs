#include <iostream>
#include <math.h>
#include <cstdlib>
#include <windows.h>
#include <iomanip>
#include <list>
#include <fstream>
#include <SFML/Graphics.hpp>
#include <SFML/Network.hpp>
#include <SFML/Audio.hpp>

#define INFO_AMOUNT 12

using namespace std;

sf::Image loadMap(string track, list<sf::Vector2u> &spawnpoints){
    spawnpoints.clear();
    fstream plik;
    sf::Image output;
    if(!track.length()){
        cout<<"loadMap("") called\n";
        return output;
    }
    plik.open(track, ios::in | ios::binary);
    if(plik.good()){
        unsigned char ch, structure=0, to_load=0;
        int width=0, height=0, uintbuffer[8];
        sf::Color solid(80, 100, 0);
        for(int i=0; i<4; i++){
            if(!(plik>>noskipws>>ch)){
                cout<<track<<"`s metadata broken\n";
                return output;
            }
            width=width<<8;
            width+=ch;
        }
        for(int i=0; i<4; i++){
            if(!(plik>>noskipws>>ch)){
                cout<<track<<"`s metadata broken\n";
                return output;
            }
            height=height<<8;
            height+=ch;
        }
        output.create(width, height, sf::Color(0,0,0,0));
        while(plik>>noskipws>>ch){
            if(structure==1){
                uintbuffer[(to_load)/4]=uintbuffer[(to_load)/4]<<8;
                uintbuffer[(to_load)/4]+=ch;
                if(!to_load){
                    spawnpoints.push_back(sf::Vector2u(uintbuffer[1], uintbuffer[0]));
                    structure=0;
                }
            }else
            if(structure==2){
                uintbuffer[(to_load)/4]=uintbuffer[(to_load)/4]<<8;
                uintbuffer[(to_load)/4]+=ch;
                if(!to_load){
                    for(int i=0; i<uintbuffer[1]; i++)
                        if(i+uintbuffer[3]<width){
                            for(int j=0; j<uintbuffer[0]; j++)
                                if(j+uintbuffer[2]<height){
                                    output.setPixel(i+uintbuffer[3], j+uintbuffer[2], solid);
                                }else break;
                        }else break;
                    structure=0;
                }
            }

            if(!structure){
                if(ch==1){
                    structure=1;
                    to_load=8;
                }else
                if(ch==2){
                    structure=2;
                    to_load=16;
                }
            }
            to_load--;
        }
        plik.close();
    }else{
        cout<<"plik "<<track<<" is not good\n";
    }
    return output;
}

bool copyToClipboard(string input){
    HGLOBAL hglbCopy;
    LPTSTR  lptstrCopy;

    if(!OpenClipboard(0))
        return 0;
    EmptyClipboard();
    if(!input.length()){
        CloseClipboard();
        return 0;
    }

    hglbCopy=GlobalAlloc(GMEM_MOVEABLE, input.length()+1);
    if(!hglbCopy){
        CloseClipboard();
        return 0;
    }

    memcpy(GlobalLock(hglbCopy), &input[0], input.length()+1);
    GlobalUnlock(hglbCopy);
    SetClipboardData(CF_TEXT, hglbCopy);
    CloseClipboard();
    return 1;
}

sf::TcpSocket clientsocket;
sf::Socket::Status status;
unsigned char data[128]={1}, receiving=0, deltareceive=0;
sf::Texture ont, offt;
sf::Sprite connectionS;
bool connected=0;

bool connect(string ip, string port){
    sf::IpAddress ipaddress0(ip);
    if(ipaddress0==sf::IpAddress::None){
        cout<<"invalid ip\n";
        return 0;
    }
    status=clientsocket.connect(ipaddress0, atoi(port.c_str()));
    if(status!=sf::Socket::Done)
    {
        cout<<"not connected\n";
        return 0;
    }
    clientsocket.setBlocking(0);
    if (clientsocket.send(data, 1) != sf::Socket::Done){
        cout<<"failed to send\n";
        return 0;
    }
    connectionS.setTexture(ont);
    connected=1;
    return 1;
}

//{
sf::RenderWindow window(sf::VideoMode(1200, 720), "worms");
sf::Event event;
sf::Color bgcolor(40,40,40), checkedclr(0,255,255), normalclr(0,255,0);
sf::Texture backgroundt, inputbart, binputbart, okt, bgplanet, reloadgamelistt, soundicont, soundbart, soundpointert;
sf::Sprite  backgrounds, inputbars, binputbars, okconnects, oknicks, okcreaterooms, bgplanes, reloadgamelists, soundicons, soundbars, soundpointers;
sf::Image backgroundi, bgplanei;
sf::Font mainfont;
sf::Text info[INFO_AMOUNT], ipinput, portinput, nickinput, roomnameinput, passwordinput;
sf::Music soundtrack;
bool bounds[4];//up,right,down,left
bool soundbarexchanged=0, soundpointerpressed=0;
enum modes{ingame, connectroom, lobby};
enum textboxes{none=0, ipbox, portbox, nickbox, roomnamebox, passwordbox, seedbox, listbox};
modes mode=connectroom;
textboxes textbox=none;
string buffer, nickname, restofprotocol, protbuffers[3];
size_t received=0;
unsigned int myid=0, to_receive=0, to_ignore=0, lastgamelistelement=0, frame=0, protbufferi[6];
float deltagamelist=120;


//zmienne do lobby
string lobbyname;
sf::Text lobbynamet, seedinput;
sf::Texture lobbyoutt, checkboxon, checkboxoff, ready1, ready2;
sf::Sprite  lobbyouts, cb2players, cb3players, cb4players, oksettings, readys;
int playersamount=2;
bool ready=0, changingsettings=0;;
list<sf::Vector2u> spawnpoints;


//zmienne do rozgrywki
sf::Color playercolors[4];
sf::Texture wormt[9];
sf::Vector2f deltabg(0,0);
float mapscale=0.2;



class gamelistelements{public:
    unsigned int id, pos;
    string name, password;
    sf::Text namet, idt, passwordt;

    gamelistelements(unsigned int posin=1, unsigned int idin=0, string namein="", string passwordin="haslo"){
        pos=posin;
        id=idin;
        name=namein;
        password=passwordin;

        namet.setFont(mainfont);
        namet.setColor(normalclr);
        namet.setCharacterSize(12);
        namet.setString(name);
        idt.setFont(mainfont);
        idt.setColor(normalclr);
        idt.setCharacterSize(12);
        idt.setString(to_string(id));
        passwordt.setFont(mainfont);
        passwordt.setColor(normalclr);
        passwordt.setCharacterSize(12);
        passwordt.setString(password);
    }

    gamelistelements operator =(gamelistelements &input){
        input.id=id;
        input.name=name;
        input.pos=pos;
        input.password=password;
        input.namet.setString(name);
        input.idt.setString(to_string(id));
        input.passwordt.setString(password);
    }

    void update(){
        namet.setString(name);
        idt.setString(to_string(id));
        passwordt.setString(password);
    }

    void draw(sf::RenderWindow &window, sf::Sprite &sprite, sf::Sprite &bsprite){
        sprite.setPosition(0, deltagamelist+pos*sprite.getLocalBounds().height);
        window.draw(sprite);
        bsprite.setPosition(sprite.getLocalBounds().width, deltagamelist+pos*sprite.getLocalBounds().height);
        window.draw(bsprite);
        sprite.setPosition(bsprite.getLocalBounds().width+sprite.getLocalBounds().width, deltagamelist+pos*sprite.getLocalBounds().height);
        window.draw(sprite);
        passwordt.setPosition(bsprite.getLocalBounds().width+sprite.getLocalBounds().width+8, deltagamelist+pos*sprite.getLocalBounds().height+8);
        window.draw(passwordt);
        namet.setPosition(sprite.getLocalBounds().width+8, deltagamelist+pos*sprite.getLocalBounds().height+8);
        window.draw(namet);
        idt.setPosition(8, deltagamelist+pos*sprite.getLocalBounds().height+8);
        window.draw(idt);
    }
};
list<gamelistelements> gamelist;
gamelistelements *gamelistpointer;

class player;

class worm{public:
    sf::Vector2f position;
    unsigned int hp, direction, team, id, animcount;
    sf::Sprite sprite;

    worm(sf::Vector2f positionin=sf::Vector2f(0,0), unsigned int teamin=0, unsigned int hpin=200, unsigned int idin=0){
        position=positionin;
        team=teamin;
        hp=hpin;
        id=idin;
        direction=1;
        animcount=0;
        sprite.setTexture(wormt[0]);
        sprite.setPosition((deltabg+position)*mapscale);
        sprite.setScale(mapscale, mapscale);
    }

    worm operator =(worm input){
        position=input.position;
        hp=input.hp;
        direction=input.direction;
        team=input.team;
        id=input.id;
        sprite=input.sprite;
    }

    void draw(sf::RenderWindow &window){
        window.draw(sprite);
    }

    void update(){cout<<(deltabg*mapscale).x<<"\n";
        sprite.setPosition((deltabg+position)*mapscale);
        sprite.setScale(mapscale, mapscale);
    }
};
vector<worm*> wormpointers;

class player{public:
    worm worms[5];
    unsigned char id, hp, emptyworm;
    string name;
    sf::Text namet;
    sf::Color color;
    sf::Texture hpbart;
    sf::Sprite hpbars;

    player(unsigned int idin=0, string namein="guest"){
        id=idin;
        name=namein;
        color=playercolors[id];
        hp=0;
        emptyworm=0;
        namet.setString(namein);
        namet.setCharacterSize(12);
        namet.setColor(color);
        namet.setPosition(0,id*40);

        sf::Image image;
        image.create(1,1,color);
        hpbart.loadFromImage(image);
        hpbars.setTexture(hpbart,1);
        hpbars.setScale(hp, 10);
        hpbars.setPosition(0, 30+40*id);
    }

    bool addworm(worm newworm){
        if(emptyworm>4)return 0;
        worms[emptyworm]=newworm;
        hp+=newworm.hp;
        emptyworm++;
        return 1;
    }

    void draw(sf::RenderWindow &window){
        window.draw(hpbars);
        window.draw(namet);
        for(int i=0; i<5; i++){
            worms[i].draw(window);
        }
    }

};
vector<player> players;

void placek(sf::Image &image, int x, int y,unsigned int r){cout<<x<<", "<<y<<", "<<r;
    sf::Vector2f margins;
    margins.x=image.getSize().x;
    margins.y=image.getSize().y;
    for(int i=x-r; i<=x+r; i++){
        if(i>=margins.x)break;
        if(i>=0){
            for(int j=y-r; j<=y+r; j++){
                if(j>=margins.y)break;
                if(j>=0){
                    if(fabs(i-x)*fabs(i-x)+fabs(j-y)*fabs(j-y)<=r*r)image.setPixel(i, j, sf::Color(80,100,0));
                }
            }
        }
    }cout<<"\n";
}

void createmap(unsigned int seed){
    if(seed==1){
        backgroundt.loadFromImage(loadMap("1.map", spawnpoints));
        backgrounds.setTexture(backgroundt);
    }else{
        srand(seed);
        backgroundi.create(6000, 3600, sf::Color(0,0,0,0));
        for(int i=0; i<6000; i++){
            for(int j=3580; j<3600; j++){
                backgroundi.setPixel(i,j, sf::Color(255,0,0));
            }
        }
        {
            int j=3600, j2=3600;
            for(int i=1000; i<=6000; i+=5){
                if(!(rand()%300)){
                    if((rand()%2)&&(j<3100))j+=400;
                    else        j-=400;
                }
                if(i<rand()%2000+2000)j2=-fabs(rand()%8-3)+1;
                else                  j2=fabs(rand()%8-3)-1;
                for(int k=i; k<i+5; k++){
                    for(int n=j+j2/-(k-i-5); ((n<3600)&&(n>=0)); n++){
                        backgroundi.setPixel(k, n, sf::Color(80, 100, 0));
                    }
                }
                j+=j2;
            }
        }
        for(int i=0; i<rand()%100+20; i++){
            placek(backgroundi,(rand()%6000), (rand()%3600), (rand()%200+40));
        }
        backgroundt.loadFromImage(backgroundi);
        backgrounds.setTexture(backgroundt);
    }
}

void protocol3(string buffer, unsigned int idbuffer){
    if(buffer.length()<=20){
        if(connected){
            unsigned char to_send[25]={0};
            to_send[0]=3;
            for(int i=4; i>0; i--){
                to_send[i]=idbuffer%256;
                idbuffer=idbuffer>>8;
            }
            for(int i=0; i<buffer.length(); i++){
                to_send[i+5]=buffer[i];
            }
            if(clientsocket.send(to_send, 25)==sf::Socket::Done) cout<<"poszlo 0x3\n"; else cout<<"sending error\n";
        }else cout<<"not connected, cannot get nick\n";
    }else cout<<"nick must have no more than 20 letters\n";
}

void protocol7(string buffer, unsigned int idbuffer, string buffer2){
    if(connected){
        unsigned char to_send[26+(buffer.length())];
        to_send[0]=7;
        for(int i=4; i>0; i--){
            to_send[i]=idbuffer%256;
            idbuffer=idbuffer>>8;
        }
        for(int i=5; i<25; i++){
            if(i-5<buffer2.length()){
                to_send[i]=buffer2[i-5];
            }else
                to_send[i]=0;
        }
        to_send[25]=buffer.length();
        for(int i=26; i<to_send[25]+26; i++){
            to_send[i]=buffer[i-26];
        }
        if(clientsocket.send(to_send, 26+(buffer.length()))==sf::Socket::Done) cout<<"poszlo 0x7\n";
        else cout<<"sending error\n";
    }else cout<<"not connected, can not create room\n";
}

void protocol9(unsigned int idbuffer, unsigned int seed, unsigned char playersamount){
    if(connected){
		unsigned char to_send[10];
		to_send[0]=9;
		for(int i=4; i>0; i--){
			to_send[i]=idbuffer%256;
			idbuffer=idbuffer>>8;
		}
		for(int i=8; i>4; i--){
			to_send[i]=seed%256;
			seed=seed>>8;
		}
		to_send[9]=playersamount;
		if(clientsocket.send(to_send, 10)==sf::Socket::Done) cout<<"poszlo 0x9\n";
		else cout<<"sending error\n";
    }else cout<<"not connected, cannot change settings\n";
}

void protocol10(unsigned int id, unsigned int gameid, string password){
    if(password.length()<256){
        if(connected){
            unsigned char length=password.length(), to_send[10+length];
            to_send[0]=0x10;
            for(int i=4; i>0; i--){
                to_send[i]=id%256;
                id=id>>8;
            }
            protbufferi[0]=gameid;
            for(int i=8; i>4; i--){
                to_send[i]=gameid%256;
                gameid=gameid>>8;
            }
            protbuffers[0]=password;
            to_send[9]=length;
            for(int i=0; i<length; i++){
                to_send[i+10]=password[i];
            }
            if(clientsocket.send(to_send, 10+length)==sf::Socket::Done){
                cout<<"poszlo 0x10\n";
            }else cout<<"sending error 0x10\n";
        }else cout<<"not connected, cannot join\n";
    }else cout<<"password too long (255 chars max)\n";
}

void protocol12(unsigned int id){
    if(connected){
        unsigned char to_send[5];
        to_send[0]=0x12;
        for(int i=4; i>0; i--){
            to_send[i]=id%256;
            id=id>>8;
        }
        if(clientsocket.send(to_send, 5)==sf::Socket::Done){
            cout<<"poszlo 0x12\n";
        }else cout<<"sending error 0x12\n";
    }else cout<<"not connected, cannot get ready\n";
}

void protocol15(unsigned int id){
    if(connected){
        unsigned char to_send[5];
        to_send[0]=0x15;
        for(int i=4; i>0; i--){
            to_send[i]=id%256;
            id=id>>8;
        }
        if(clientsocket.send(to_send, 5)==sf::Socket::Done){
            cout<<"poszlo 0x15\n";
        }else cout<<"sending error 0x15\n";
    }else cout<<"not connected, cannot get players list\n";
}

void protocol17(unsigned int id){
    if(connected){
        unsigned char to_send[5];
        to_send[0]=0x17;
        for(int i=4; i>0; i--){
            to_send[i]=id%256;
            id=id>>8;
        }
        if(clientsocket.send(to_send, 5)==sf::Socket::Done){
            cout<<"poszlo\n";
        }else cout<<"sending error 0x17\n";
    }else cout<<"not connected, cannot get worms list\n";
}
//}

void save(string track, string input){
    if((!input.length())||(!track.length()))return;
    fstream plik;
    plik.open(track, ios::out | ios::binary);
    if(plik.good()) plik<<input;
    else cout<<"plik not good\n";
    plik.close();
}

int main(){
    {
        system("color 0a");
        window.setFramerateLimit(60);
        playercolors[0]=sf::Color(0,255,0);
        playercolors[1]=sf::Color(255,255,0);
        playercolors[2]=sf::Color(0,255,255);
        playercolors[3]=sf::Color(255,0,0);
        soundtrack.openFromFile("snd/music.ogg");
        soundtrack.setVolume(0);
        soundtrack.setLoop(1);
        soundtrack.play();
        soundicont.loadFromFile("img/speaker.bmp");
        soundicons.setTexture(soundicont);
        soundicons.setPosition(1140,0);
        soundbart.loadFromFile("img/sndbar.bmp");
        soundbars.setTexture(soundbart);
        soundbars.setPosition(1150,30);
        soundpointert.loadFromFile("img/sndpointer.png");
        soundpointers.setTexture(soundpointert);
        soundpointers.setPosition(1139,24);
        inputbart.loadFromFile("img/inputbar.bmp");
        inputbars.setTexture(inputbart);
        binputbart.loadFromFile("img/binputbar.bmp");
        binputbars.setTexture(binputbart);
        okt.loadFromFile("img/ok.bmp");
        okconnects.setTexture(okt);
        okconnects.setPosition(0,60);
        oknicks.setTexture(okt);
        oknicks.setPosition(200,30);
        okcreaterooms.setTexture(okt);
        okcreaterooms.setPosition(500,60);
        oksettings.setTexture(okt);
        oksettings.setPosition(0,180);
        ont.loadFromFile("img/on.bmp");
        offt.loadFromFile("img/off.bmp");
        connectionS.setTexture(offt);
        connectionS.setPosition(1170,0);
        bgplanei.create(1, 1, bgcolor);
        bgplanet.loadFromImage(bgplanei);
        bgplanes.setTexture(bgplanet);
        bgplanes.setScale(1200, 120);
        bgplanes.setPosition(0,0);
        reloadgamelistt.loadFromFile("img/reload.bmp");
        reloadgamelists.setTexture(reloadgamelistt);
        reloadgamelists.setPosition(54, 60);
        lobbyoutt.loadFromFile("img/back.bmp");
        lobbyouts.setTexture(lobbyoutt);
        lobbyouts.setPosition(0,0);
        checkboxon.loadFromFile("img/checkboxon.bmp");
        checkboxoff.loadFromFile("img/checkboxoff.bmp");
        cb2players.setTexture(checkboxon);
        cb2players.setPosition(0,98);
        cb3players.setTexture(checkboxoff);
        cb3players.setPosition(0,128);
        cb4players.setTexture(checkboxoff);
        cb4players.setPosition(0,158);
        ready1.loadFromFile("img/ready1.bmp");
        ready2.loadFromFile("img/ready2.bmp");
        readys.setTexture(ready2);
        readys.setPosition(200,30);
        for(int i=0; i<9; i++){
            wormt[i].loadFromFile("img/rob2.0/anim"+to_string(i+1)+".png");
        }

        mainfont.loadFromFile("font.ttf");
        ipinput.setFont(mainfont);
        ipinput.setString("185.84.136.151");
        ipinput.setCharacterSize(12);
        ipinput.setPosition(8,8);
        ipinput.setColor(normalclr);
        portinput.setFont(mainfont);
        portinput.setString("31337");
        portinput.setCharacterSize(12);
        portinput.setPosition(8,38);
        portinput.setColor(normalclr);
        nickinput.setFont(mainfont);
        nickinput.setString("guest");
        nickinput.setCharacterSize(12);
        nickinput.setPosition(208,8);
        nickinput.setColor(normalclr);
        roomnameinput.setFont(mainfont);
        roomnameinput.setString("room001");
        roomnameinput.setCharacterSize(12);
        roomnameinput.setPosition(508,8);
        roomnameinput.setColor(normalclr);
        passwordinput.setFont(mainfont);
        passwordinput.setString("123");
        passwordinput.setCharacterSize(12);
        passwordinput.setPosition(508,38);
        passwordinput.setColor(normalclr);
        lobbynamet.setFont(mainfont);
        lobbynamet.setString("");
        lobbynamet.setCharacterSize(16);
        lobbynamet.setColor(normalclr);
        lobbynamet.setPosition(38,8);
        seedinput.setFont(mainfont);
        seedinput.setString("1234567");
        seedinput.setCharacterSize(12);
        seedinput.setColor(normalclr);
        seedinput.setPosition(8,38);
        for(int i=0; i<INFO_AMOUNT; i++){
            info[i].setFont(mainfont);
            info[i].setCharacterSize(12);
            info[i].setColor(normalclr);
        }
        info[0].setString("ip");
        info[0].setPosition(150,8);
        info[1].setString("port");
        info[1].setPosition(150,38);
        info[2].setString("nickname");
        info[2].setPosition(400, 8);
        info[3].setString("roomname");
        info[3].setPosition(700, 8);
        info[4].setString("password");
        info[4].setPosition(700, 38);
        info[5].setString("game id");
        info[5].setPosition(8, 98);
        info[6].setString("game name");
        info[6].setPosition(158, 98);
        info[7].setString("seed");
        info[7].setPosition(150,38);
        info[8].setString("players");
        info[8].setPosition(0,68);
        info[9].setString("2");
        info[9].setPosition(20,98);
        info[10].setString("3");
        info[10].setPosition(20,128);
        info[11].setString("4");
        info[11].setPosition(20,158);
    }
    while(window.isOpen()){
        while(window.pollEvent(event)){
            if(event.type==sf::Event::Closed){
                if(connected)
                    clientsocket.disconnect();
                window.close();
            }else
            if(event.type==sf::Event::Resized){
                window.setSize(sf::Vector2u(1200, 720));
            }
            if(mode==ingame){
                if(event.type==sf::Event::MouseWheelMoved){
                    if(event.mouseWheel.delta>0){
                        if(mapscale<1){
                            mapscale+=0.1;
                            backgrounds.setScale(mapscale, mapscale);
                            backgrounds.setPosition(deltabg*mapscale);
                            for(int i=0; i<wormpointers.size(); i++){
                                (*wormpointers[i]).update();
                            }
                        }
                    }else{
                        if(mapscale>0.2){
                            mapscale-=0.1;
                            backgrounds.setScale(mapscale, mapscale);
                            backgrounds.setPosition(deltabg*mapscale);
                            for(int i=0; i<wormpointers.size(); i++){
                                (*wormpointers[i]).update();
                            }
                        }
                    }
                }else
                if(event.type==sf::Event::MouseMoved){
                    bounds[0]=bounds[1]=bounds[2]=bounds[3]=0;
                    if(event.mouseMove.x<10) bounds[3]=1; else
                    if(event.mouseMove.x>window.getSize().x-10) bounds[1]=1;
                    if(event.mouseMove.y<10) bounds[0]=1; else
                    if(event.mouseMove.y>window.getSize().y-10) bounds[2]=1;
                }
            }else
            if(mode==connectroom){
                if(event.type==sf::Event::MouseButtonPressed){
                    if(textbox==ipbox){
                        ipinput.setColor(normalclr);
                    }else
                    if(textbox==portbox){
                        portinput.setColor(normalclr);
                    }else
                    if(textbox==nickbox){
                        nickinput.setColor(normalclr);
                    }else
                    if(textbox==roomnamebox){
                        roomnameinput.setColor(normalclr);
                    }else
                    if(textbox==passwordbox){
                        passwordinput.setColor(normalclr);
                    }else
                    if(textbox==listbox){
                        (*gamelistpointer).passwordt.setColor(normalclr);
                        gamelistpointer=0;
                    }
                    textbox=none;

                    if((event.mouseButton.y<=120)||(event.mouseButton.x>1100)){
                        if((event.mouseButton.x>=ipinput.getPosition().x-8)&&(event.mouseButton.x<=ipinput.getPosition().x-8+inputbars.getLocalBounds().width)&&(event.mouseButton.y>=ipinput.getPosition().y-8)&&(event.mouseButton.y<=ipinput.getPosition().y-8+inputbars.getLocalBounds().height)){
                            textbox=ipbox;
                            ipinput.setColor(checkedclr);
                        }else
                        if((event.mouseButton.x>=portinput.getPosition().x-8)&&(event.mouseButton.x<=portinput.getPosition().x-8+inputbars.getLocalBounds().width)&&(event.mouseButton.y>=portinput.getPosition().y-8)&&(event.mouseButton.y<=portinput.getPosition().y-8+inputbars.getLocalBounds().height)){
                            textbox=portbox;
                            portinput.setColor(checkedclr);
                        }else
                        if((event.mouseButton.x>=nickinput.getPosition().x-8)&&(event.mouseButton.x<=nickinput.getPosition().x-8+binputbars.getLocalBounds().width)&&(event.mouseButton.y>=nickinput.getPosition().y-8)&&(event.mouseButton.y<=nickinput.getPosition().y-8+binputbars.getLocalBounds().height)){
                            textbox=nickbox;
                            nickinput.setColor(checkedclr);
                        }else
                        if((event.mouseButton.x>=roomnameinput.getPosition().x-8)&&(event.mouseButton.x<=roomnameinput.getPosition().x-8+binputbars.getLocalBounds().width)&&(event.mouseButton.y>=roomnameinput.getPosition().y-8)&&(event.mouseButton.y<=roomnameinput.getPosition().y-8+binputbars.getLocalBounds().height)){
                            textbox=roomnamebox;
                            roomnameinput.setColor(checkedclr);
                        }else
                        if((event.mouseButton.x>=passwordinput.getPosition().x-8)&&(event.mouseButton.x<=passwordinput.getPosition().x-8+binputbars.getLocalBounds().width)&&(event.mouseButton.y>=passwordinput.getPosition().y-8)&&(event.mouseButton.y<=passwordinput.getPosition().y-8+binputbars.getLocalBounds().height)){
                            textbox=passwordbox;
                            passwordinput.setColor(checkedclr);
                        }else
                        if((event.mouseButton.x>=okconnects.getPosition().x)&&(event.mouseButton.x<=okconnects.getPosition().x+okconnects.getLocalBounds().width)&&(event.mouseButton.y>=okconnects.getPosition().y)&&(event.mouseButton.y<=okconnects.getPosition().y+okconnects.getLocalBounds().height)){
                            if(connect(ipinput.getString(), portinput.getString())){
                                cout<<"connected\n";
                            }
                        }else
                        if((event.mouseButton.x>=oknicks.getPosition().x)&&(event.mouseButton.x<=oknicks.getPosition().x+oknicks.getLocalBounds().width)&&(event.mouseButton.y>=oknicks.getPosition().y)&&(event.mouseButton.y<=oknicks.getPosition().y+oknicks.getLocalBounds().height)){
                            protocol3(nickinput.getString(), myid);
                        }else
                        if((event.mouseButton.x>=okcreaterooms.getPosition().x)&&(event.mouseButton.x<=okcreaterooms.getPosition().x+okcreaterooms.getLocalBounds().width)&&(event.mouseButton.y>=okcreaterooms.getPosition().y)&&(event.mouseButton.y<=okcreaterooms.getPosition().y+okcreaterooms.getLocalBounds().height)){
                            protocol7(passwordinput.getString(), myid, roomnameinput.getString());
                        }else
                        if((event.mouseButton.x>=soundpointers.getPosition().x)&&(event.mouseButton.x<=soundpointers.getPosition().x+soundpointers.getLocalBounds().width)&&(event.mouseButton.y>=soundpointers.getPosition().y)&&(event.mouseButton.y<=soundpointers.getPosition().y+soundpointers.getLocalBounds().height)){
                            soundpointerpressed=1;
                        }else
                        if((event.mouseButton.x>=soundicons.getPosition().x)&&(event.mouseButton.x<=soundicons.getPosition().x+soundicons.getLocalBounds().width)&&(event.mouseButton.y>=soundicons.getPosition().y)&&(event.mouseButton.y<=soundicons.getPosition().y+soundicons.getLocalBounds().height)){
                            soundbarexchanged=!soundbarexchanged;
                        }else
                        if((event.mouseButton.x>=reloadgamelists.getPosition().x)&&(event.mouseButton.x<=reloadgamelists.getPosition().x+reloadgamelists.getLocalBounds().width)&&(event.mouseButton.y>=reloadgamelists.getPosition().y)&&(event.mouseButton.y<=reloadgamelists.getPosition().y+reloadgamelists.getLocalBounds().height)){
                            if(connected){unsigned char gfhahdsgfgdj[1]={5};
                                if(clientsocket.send(gfhahdsgfgdj,1)!=sf::Socket::Done) cout<<"error while sending request 5\n";
                                else {
                                    gamelist.clear();
                                    lastgamelistelement=0;
                                    deltagamelist=120;
                                }
                            }else cout<<"not connected, cannot refresh\n";
                        }
                    }
                    else{
                        int listelementbuffer=int(event.mouseButton.y-deltagamelist)/int(inputbars.getLocalBounds().height);
                        if((listelementbuffer<=lastgamelistelement)&&(listelementbuffer>0)){
                            if(event.mouseButton.x<=inputbars.getLocalBounds().width+binputbars.getLocalBounds().width){
                                for(list<gamelistelements>::iterator i=gamelist.begin(); i!=gamelist.end(); ++i){
                                    if((*i).pos==listelementbuffer){
                                        protocol10(myid, (*i).id, (*i).password);
                                        break;
                                    }
                                }
                            }else
                            if(event.mouseButton.x<=inputbars.getLocalBounds().width*2+binputbars.getLocalBounds().width){
                                textbox=listbox;
                                for(list<gamelistelements>::iterator i=gamelist.begin(); i!=gamelist.end(); ++i){
                                    if((*i).pos==listelementbuffer){
                                        gamelistpointer=&(*i);
                                        (*gamelistpointer).passwordt.setColor(checkedclr);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }else
                if(event.type==sf::Event::TextEntered){sf::Text* inputpointer=0;
                    if(textbox==ipbox){inputpointer=&ipinput;
                        if((event.text.unicode==13)||(event.text.unicode==9)){
                            textbox=portbox;
                            portinput.setColor(checkedclr);
                            ipinput.setColor(normalclr);
                        }
                    }else
                    if(textbox==portbox){inputpointer=&portinput;
                        if(event.text.unicode==9){
                            textbox=ipbox;
                            portinput.setColor(normalclr);
                            ipinput.setColor(checkedclr);
                        }else
                        if(event.text.unicode==13){
                            if(connect(ipinput.getString(), portinput.getString())) cout<<"connected\n";
                        }
                    }else
                    if(textbox==nickbox){inputpointer=&nickinput;
                        if(event.text.unicode==13){
                            protocol3(nickinput.getString(), myid);
                            nickinput.setColor(normalclr);
                            inputpointer=0;
                        }
                    }else
                    if(textbox==roomnamebox){inputpointer=&roomnameinput;
                        if((event.text.unicode==13)&&(event.text.unicode==9)){
                            textbox=passwordbox;
                            passwordinput.setColor(checkedclr);
                            roomnameinput.setColor(normalclr);
                        }
                    }else
                    if(textbox==passwordbox){inputpointer=&passwordinput;
                        if(event.text.unicode==13){
                            protocol7(passwordinput.getString(), myid, roomnameinput.getString());
                            inputpointer=0;
                        }
                    }else
                    if(textbox==listbox){
                        if(event.text.unicode==13){
                            (*gamelistpointer).passwordt.setColor(normalclr);
                            textbox=none;
                        }else
                        if(event.text.unicode==8){
                            if((*gamelistpointer).password.length()){
                                (*gamelistpointer).password.erase((*gamelistpointer).password.length()-1);
                                (*gamelistpointer).update();
                            }
                        }else
                        if((event.text.unicode==127)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            (*gamelistpointer).password="";
                            (*gamelistpointer).update();
                        }else
                        if((event.text.unicode==3)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            copyToClipboard((*gamelistpointer).password);
                        }else
                        if((event.text.unicode==22)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            if(OpenClipboard(0)){
                                (*gamelistpointer).password=((*gamelistpointer).password+(char*)(GetClipboardData(CF_TEXT)));
                                CloseClipboard();
                                (*gamelistpointer).update();
                            }
                        }else
                        {
                            (*gamelistpointer).password+=event.text.unicode;
                            (*gamelistpointer).update();
                        }
                    }
                    if(inputpointer){
                        if(event.text.unicode==8){
                            buffer=(*inputpointer).getString();
                            if(buffer.length()){
                                buffer.erase(buffer.length()-1);
                                (*inputpointer).setString(buffer);
                            }
                        }else
                        if((event.text.unicode==127)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            (*inputpointer).setString("");
                        }else
                        if((event.text.unicode==3)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            copyToClipboard((*inputpointer).getString());
                        }else
                        if((event.text.unicode==22)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            if(OpenClipboard(0)){
                                (*inputpointer).setString((*inputpointer).getString()+(char*)(GetClipboardData(CF_TEXT)));
                                CloseClipboard();
                            }
                        }else
                        {
                            (*inputpointer).setString((*inputpointer).getString()+event.text.unicode);
                        }
                    }
                }else
                if(event.type==sf::Event::MouseWheelMoved){
                    if(connected)
                        deltagamelist-=event.mouseWheel.delta*10;
                }else
                if(event.type==sf::Event::MouseButtonReleased){
                    soundpointerpressed=0;
                }else
                if(event.type==sf::Event::MouseMoved){
                    if(soundpointerpressed){
                        soundtrack.setVolume((event.mouseMove.y-30)*(event.mouseMove.y>30)-(event.mouseMove.y-130)*(event.mouseMove.y>130));
                        soundpointers.setPosition(1139, 24+soundtrack.getVolume());
                    }
                }
            }else
            if(mode==lobby){
                if(event.type==sf::Event::MouseButtonPressed){
                    if(textbox==seedbox){
                        seedinput.setColor(normalclr);
                    }

                    if((event.mouseButton.x>=lobbyouts.getPosition().x)&&(event.mouseButton.x<=lobbyouts.getPosition().x+lobbyouts.getLocalBounds().width)&&(event.mouseButton.y>=lobbyouts.getPosition().y)&&(event.mouseButton.y<=lobbyouts.getPosition().y+lobbyouts.getLocalBounds().height)){
                        mode=connectroom;
                    }else
                    if((event.mouseButton.x>=cb2players.getPosition().x)&&(event.mouseButton.x<=cb2players.getPosition().x+cb2players.getLocalBounds().width)&&(event.mouseButton.y>=cb2players.getPosition().y)&&(event.mouseButton.y<=cb2players.getPosition().y+cb2players.getLocalBounds().height)){
                        switch(playersamount){
                            case 3:
                                cb3players.setTexture(checkboxoff);
                            break;
                            case 4:
                                cb4players.setTexture(checkboxoff);
                            break;
                        }
                        cb2players.setTexture(checkboxon);
                        playersamount=2;
                    }else
                    if((event.mouseButton.x>=cb3players.getPosition().x)&&(event.mouseButton.x<=cb3players.getPosition().x+cb3players.getLocalBounds().width)&&(event.mouseButton.y>=cb3players.getPosition().y)&&(event.mouseButton.y<=cb3players.getPosition().y+cb3players.getLocalBounds().height)){
                        switch(playersamount){
                            case 2:
                                cb2players.setTexture(checkboxoff);
                            break;
                            case 4:
                                cb4players.setTexture(checkboxoff);
                            break;
                        }
                        cb3players.setTexture(checkboxon);
                        playersamount=3;
                    }else
                    if((event.mouseButton.x>=cb4players.getPosition().x)&&(event.mouseButton.x<=cb4players.getPosition().x+cb4players.getLocalBounds().width)&&(event.mouseButton.y>=cb4players.getPosition().y)&&(event.mouseButton.y<=cb4players.getPosition().y+cb4players.getLocalBounds().height)){
                        switch(playersamount){
                            case 2:
                                cb2players.setTexture(checkboxoff);
                            break;
                            case 3:
                                cb3players.setTexture(checkboxoff);
                            break;
                        }
                        cb4players.setTexture(checkboxon);
                        playersamount=4;
                    }else
                    if((changingsettings)&&(event.mouseButton.x>=oksettings.getPosition().x)&&(event.mouseButton.x<=oksettings.getPosition().x+oksettings.getLocalBounds().width)&&(event.mouseButton.y>=oksettings.getPosition().y)&&(event.mouseButton.y<=oksettings.getPosition().y+oksettings.getLocalBounds().height)){
                        if(seedinput.getString().getSize()<10) protocol9(myid, atoi(seedinput.getString().toAnsiString().c_str()), playersamount);
                        else cout<<"seed is too big\n";
                    }else
                    if((event.mouseButton.x>=readys.getPosition().x)&&(event.mouseButton.x<=readys.getPosition().x+readys.getLocalBounds().width)&&(event.mouseButton.y>=readys.getPosition().y)&&(event.mouseButton.y<=readys.getPosition().y+readys.getLocalBounds().height)){
                        if(!ready)
                            protocol12(myid);
                    }else
                    if((event.mouseButton.x>=soundpointers.getPosition().x)&&(event.mouseButton.x<=soundpointers.getPosition().x+soundpointers.getLocalBounds().width)&&(event.mouseButton.y>=soundpointers.getPosition().y)&&(event.mouseButton.y<=soundpointers.getPosition().y+soundpointers.getLocalBounds().height)){
                        soundpointerpressed=1;
                    }else
                    if((event.mouseButton.x>=soundicons.getPosition().x)&&(event.mouseButton.x<=soundicons.getPosition().x+soundicons.getLocalBounds().width)&&(event.mouseButton.y>=soundicons.getPosition().y)&&(event.mouseButton.y<=soundicons.getPosition().y+soundicons.getLocalBounds().height)){
                        soundbarexchanged=!soundbarexchanged;
                    }else
                    if((changingsettings)&&(event.mouseButton.x>=seedinput.getPosition().x-8)&&(event.mouseButton.x<=seedinput.getPosition().x-8+inputbars.getLocalBounds().width)&&(event.mouseButton.y>=seedinput.getPosition().y-8)&&(event.mouseButton.y<=seedinput.getPosition().y-8+inputbars.getLocalBounds().height)){
                        seedinput.setColor(checkedclr);
                        textbox=seedbox;
                    }
                }else
                if(event.type==sf::Event::TextEntered){sf::Text* inputpointer=0;
                    if(textbox==seedbox){
                        if(event.text.unicode==13){
                            seedinput.setColor(normalclr);
                            inputpointer=0;
                        }else
                        if((event.text.unicode>='0')&&(event.text.unicode<='9')&&(seedinput.getString().getSize()<10)){
                            seedinput.setString(seedinput.getString()+event.text.unicode);
                        }else
                        if(event.text.unicode==8) inputpointer=&seedinput;
                        else cout<<", "<<int(event.text.unicode);
                    }

                    if(inputpointer){
                        if(event.text.unicode==8){
                            buffer=(*inputpointer).getString();
                            if(buffer.length()){
                                buffer.erase(buffer.length()-1);
                                (*inputpointer).setString(buffer);
                            }
                        }else
                        if((event.text.unicode==127)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            (*inputpointer).setString("");
                        }else
                        if((event.text.unicode==3)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            copyToClipboard((*inputpointer).getString());
                        }else
                        if((event.text.unicode==22)&&((sf::Keyboard::isKeyPressed(sf::Keyboard::LControl))||(sf::Keyboard::isKeyPressed(sf::Keyboard::RControl)))){
                            if(OpenClipboard(0)){
                                (*inputpointer).setString((*inputpointer).getString()+(char*)(GetClipboardData(CF_TEXT)));
                                CloseClipboard();
                            }
                        }else
                        {
                            (*inputpointer).setString((*inputpointer).getString()+event.text.unicode);
                        }
                    }
                }else
                if(event.type==sf::Event::MouseButtonReleased){
                    soundpointerpressed=0;
                }else
                if(event.type==sf::Event::MouseMoved){
                    if(soundpointerpressed){
                        soundtrack.setVolume((event.mouseMove.y-30)*(event.mouseMove.y>30)-(event.mouseMove.y-130)*(event.mouseMove.y>130));
                        soundpointers.setPosition(1139, 24+soundtrack.getVolume());
                    }
                }
            }
        }
        if(bounds[3]){
            if(backgrounds.getPosition().x<-9){
                backgrounds.move(10, 0);
                deltabg.x+=10/mapscale;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }else
            if(backgrounds.getPosition().x<0){
                backgrounds.setPosition(0, backgrounds.getPosition().y);
                deltabg.x=0;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }
        }else
        if(bounds[1]){
            if(backgrounds.getPosition().x+(backgrounds.getLocalBounds().width*backgrounds.getScale().x)>window.getSize().x+9){
                backgrounds.move(-10, 0);
                deltabg.x-=10/mapscale;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }else
            if(backgrounds.getPosition().x+(backgrounds.getLocalBounds().width*backgrounds.getScale().x)>window.getSize().x){
                backgrounds.setPosition(window.getSize().x-(backgrounds.getLocalBounds().width*backgrounds.getScale().x), backgrounds.getPosition().y);
                deltabg.x-=window.getSize().x-(backgrounds.getLocalBounds().width*backgrounds.getScale().x)/mapscale;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }
        }
        if(bounds[0]){
            if(backgrounds.getPosition().y<-9){
                backgrounds.move(0, 10);
                deltabg.y+=10/mapscale;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }else
            if(backgrounds.getPosition().y<0){
                backgrounds.setPosition(0, backgrounds.getPosition().y);
                deltabg.y=0;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }
        }else
        if(bounds[2]){
            if(backgrounds.getPosition().y+(backgrounds.getLocalBounds().height*backgrounds.getScale().y)>window.getSize().y+9){
                backgrounds.move(0, -10);
                deltabg.y-=10/mapscale;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }else
            if(backgrounds.getPosition().y+(backgrounds.getLocalBounds().height*backgrounds.getScale().y)>window.getSize().y){
                backgrounds.setPosition(window.getSize().y-(backgrounds.getLocalBounds().height*backgrounds.getScale().y), backgrounds.getPosition().y);
                deltabg.y-=window.getSize().y-(backgrounds.getLocalBounds().height*backgrounds.getScale().y)/mapscale;
                for(int i=0; i<wormpointers.size(); i++){
                    (*wormpointers[i]).update();
                }
            }
        }


        if(clientsocket.receive(data, 128, received)==sf::Socket::Done){
            if(!receiving)
            for(int i=0; i<received; i++){
                if(!to_ignore){
                    if(!data[i]){
                        clientsocket.disconnect();
                        cout<<"\ndisconnected\n";
                        connectionS.setTexture(offt);
                        connected=0;
                        break;
                    }
                    if(data[i]==2){
                        receiving=2;
                        deltareceive=i+1;
                        break;
                    }
                    if(data[i]==4){
                        i++;
                        if(i<received){
                            if(data[i]){
                                nickname=nickinput.getString();
                                cout<<"nick accepted\n"<<char(7);
                            }else{
                                cout<<"nick denited\n";
                            }
                        }else cout<<"lost response 0x4\n";
                        continue;
                    }
                    if(data[i]==6){
                        receiving=6;
                        deltareceive=i+1;
                        break;
                    }
                    if(data[i]==8){
                        i++;
                        if(i<received){
                            if(data[i]){
                                mode=lobby;
                                lobbyname=roomnameinput.getString();
                                lobbynamet.setString(lobbyname);
                                changingsettings=1;
                                cout<<"room accepted\n"<<char(7);
                            }else{
                                cout<<"room denited\n";
                            }
                        }else cout<<"lost response 0x8\n";
                        continue;
                    }
                    if(data[i]==10){
                        i++;
                        if(i<received){
                            if(data[i]){
                                mode=lobby;
                                lobbyname=roomnameinput.getString();
                                lobbynamet.setString(lobbyname);
                                changingsettings=0;
                                cout<<"settings accepted\n"<<char(7);
                            }else{
                                cout<<"settings denited\n";
                            }
                        }else cout<<"lost response 0xa\n";
                        continue;
                    }
                    if(data[i]==0x11){
                        receiving=0x11;
                        deltareceive=i+1;
                        to_receive=5;
                        protbufferi[2]=0;
                        passwordinput.setString(protbuffers[0]);
                        for(list<gamelistelements>::iterator i=gamelist.begin(); i!=gamelist.end(); ++i){
                            if(protbufferi[0]==(*i).id){
                                lobbyname=(*i).name;
                                lobbynamet.setString(lobbyname);
                                break;
                            }
                        }
                        break;
                    }
                    if(data[i]==0x13){
                        i++;
                        if(i<received){
                            if(data[i]){
                                readys.setTexture(ready1);
                                ready=1;
                                cout<<"ready\n"<<char(7);
                            }else{
                                readys.setTexture(ready2);
                                ready=0;
                                connected=0;
                                clientsocket.disconnect();
                                connectionS.setTexture(offt);
                                cout<<"not ready?\nso disconnect\n";
                            }
                        }else cout<<"lost response 0x13\n";
                        continue;
                    }
                    if(data[i]==0x14){
                        soundtrack.stop();
                        protocol15(myid);
                        backgroundt.loadFromImage(loadMap(seedinput.getString()+".map", spawnpoints));
                        backgrounds.setTexture(backgroundt, 1);
                        mode=ingame;
                        break;
                    }
                    if(data[i]==0x16){
                        receiving=0x16;
                        deltareceive=i+1;
                        to_receive=4;
                        protbufferi[0]=1;
                        cout<<"receiving players\n";
                        break;
                    }
                    if(data[i]==0x18){
                        receiving=0x18;
                        deltareceive=i+1;
                        to_receive=4;
                        protbufferi[0]=1;
                        for(int j=1; j<7; j++)
                            protbufferi[j]=0;
                        cout<<"receiving worms\n";
                        break;
                    }
                    if(data[i]==0xe0){
                        cout<<"unknown opcode\n";
                        continue;
                    }
                    if(data[i]==0xe1){
                        cout<<"bad parameters\n";
                        continue;
                    }
                    if(data[i]==0xe2){
                        cout<<"server error\n";
                        continue;
                    }
                    cout<<"recieved unknown protocol: "<<int(data[i])<<"\n";
                }else to_ignore--;
            }

            if(receiving==2){
                for(int i=deltareceive; i<deltareceive+4; i++){
                    if(i>=received){
                        cout<<deltareceive+4-i<<"/"<<4<<" of your id missed\n";
                        receiving=0;
                        break;
                    }
                    myid=myid<<8;
                    myid+=data[i];
                }
                receiving=0;
                save("sesja.iff", to_string(myid));
                cout<<"myid="<<myid<<"\n";
            }else
            if(receiving==6){
                if(deltareceive){
                    for(int i=deltareceive; i<deltareceive+4; i++){
                        if(i>=received){
                            cout<<deltareceive+4-i<<"/"<<4<<" of rooms` list checksum missed\n";
                            receiving=0;
                            break;
                        }
                        to_receive=to_receive<<8;
                        to_receive+=data[i];
                    }
                    to_receive*=24;
                    deltareceive+=4;
                }
                if(to_receive==0){
                    cout<<"roomlist is empty\n";
                    receiving=0;
                    deltareceive=0;
                }else
                    for(int i=deltareceive; i<received; i++){
                        if(to_receive%24==0){
                            lastgamelistelement++;
                            if(!gamelist.empty()){
                                list<gamelistelements>::iterator j=gamelist.end(); j--;
                                (*j).update();
                            }
                            gamelist.push_back(gamelistelements(lastgamelistelement));
                        }
                        to_receive--;
                        list<gamelistelements>::iterator j=gamelist.end(); j--;
                        if(to_receive%24>19){
                            (*j).id=(*j).id<<8;
                            (*j).id+=data[i];
                        }else{
                            if(data[i])
                                (*j).name+=data[i];
                        }
                        if(!to_receive){
                            (*j).update();
                            receiving=0;
                            deltareceive=0;
                            break;
                        }
                    }
                deltareceive=0;
            }else
            if(receiving==0x11){
                for(int i=deltareceive; ((i<received)||(to_receive>0)); i++){
                    if(to_receive==5){
                        if(data[i]){
                            cout<<"joined\n"<<char(7);
                            mode=lobby;
                        }else{
                            cout<<"not joined\n";
                            to_receive=0;
                            break;
                        }
                    }
                    else{
                        protbufferi[2]=protbufferi[2]<<8;
                        protbufferi[2]+=data[i];
                    }

                    to_receive--;
                }
                deltareceive=0;
                if(!to_receive){
                    seedinput.setString(to_string(protbufferi[2]));
                    receiving=0;
                }
            }else
            if(receiving==0x16){
                for(int i=deltareceive; i<received; i++){
                    if(protbufferi[0]){
                        protbufferi[1]=protbufferi[1]<<8;
                        protbufferi[1]+=data[i];
                    }else{
                        if(!(to_receive%21)){
                            if(protbufferi[1]!=40){
                                players.push_back(player(protbufferi[1], protbuffers[0]));
                            }
                            protbufferi[1]=data[i];
                            protbuffers[0]="";
                        }else{
                            if(data[i])
                                protbuffers[0]+=data[i];
                        }
                    }
                    to_receive--;
                    if(!to_receive){
                        if(protbufferi[0]){//end of metadata
                            protbufferi[0]=0;
                            to_receive=21*protbufferi[1];
                            if(protbufferi[1]==0){
                                cout<<"empty player list?\ndisconnecting\n";
                                receiving=0;
                                clientsocket.disconnect();
                                break;
                            }
                            protbufferi[1]=40;
                        }else
                        {//end of protocol
                            receiving=0;
                            playersamount=protbufferi[1]+1;
                            players.push_back(player(protbufferi[1], protbuffers[0]));
                            protbufferi[1]=0;
                            protbuffers[0]="";
                            for(int i=0; i<playersamount; i++){
                                cout<<"player["<<i<<"]="<<int(players[i].id)<<", "<<players[i].name<<"\n";
                            }
                            protocol17(myid);
                            break;
                        }
                    }
                }
            }else
            if(receiving==0x18){
                for(int i=deltareceive; i<received; i++){//1=team, 2=x, 3=y, 4=hp, 5=id
                    if(protbufferi[0]){
                        protbufferi[1]=protbufferi[1]<<8;
                        protbufferi[1]+=data[i];
                    }else{
                        if(!(to_receive%11)){
                            if(protbufferi[1]<4){
                                if(players[protbufferi[1]].addworm(worm(sf::Vector2f(protbufferi[2], protbufferi[3]), protbufferi[1], protbufferi[4], protbufferi[5])))
                                    wormpointers.push_back(&players[protbufferi[1]].worms[players[protbufferi[1]].emptyworm-1]);
                                else{
                                    for(int j=0; j<wormpointers.size(); j++){
                                        if((*wormpointers[j]).id==protbufferi[5]){
                                            (*wormpointers[j])=worm(sf::Vector2f(protbufferi[2], protbufferi[3]), protbufferi[1], protbufferi[4], protbufferi[5]);
                                            break;
                                        }
                                    }
                                }
                            }else{
                                if(protbufferi[1]!=40)
                                    cout<<"wrong data, playerid="<<protbufferi[1]<<"\n";
                            }
                            protbufferi[1]=data[i];
                        }else
                        if((to_receive%11)>=7){
                            protbufferi[2]=protbufferi[2]<<8;
                            protbufferi[2]+=data[i];
                        }else
                        if((to_receive%11)>=3){
                            protbufferi[3]=protbufferi[3]<<8;
                            protbufferi[3]+=data[i];
                        }else
                        if((to_receive%11)==2){
                            protbufferi[4]=data[i];
                        }else
                        if((to_receive%11)==1){
                            protbufferi[5]=data[i];
                        }
                    }
                    to_receive--;
                    if(!to_receive){
                        if(protbufferi[0]){//end of metadata
                            protbufferi[0]=0;
                            to_receive=11*protbufferi[1];
                            if(protbufferi[1]==0){
                                cout<<"empty worms list?\ndisconnecting\n";
                                receiving=0;
                                clientsocket.disconnect();
                                break;
                            }
                            protbufferi[1]=40;
                        }else
                        {//end of protocol
                            receiving=0;
                            if(protbufferi[1]<4){
                                if(players[protbufferi[1]].addworm(worm(sf::Vector2f(protbufferi[2], protbufferi[3]), protbufferi[1], protbufferi[4], protbufferi[5])))
                                    wormpointers.push_back(&players[protbufferi[1]].worms[players[protbufferi[1]].emptyworm-1]);
                                else{
                                    for(int j=0; j<wormpointers.size(); j++){
                                        if((*wormpointers[j]).id==protbufferi[5]){
                                            (*wormpointers[j])=worm(sf::Vector2f(protbufferi[2], protbufferi[3]), protbufferi[1], protbufferi[4], protbufferi[5]);
                                            break;
                                        }
                                    }
                                }
                            }else{
                                cout<<"wrong data, playerid="<<protbufferi[1]<<"\n";
                            }
                            for(int j=1; j<7; j++)
                                protbufferi[j]=0;
                            break;
                        }
                    }
                }protocol17(myid);
            }
        }
        frame++;
        if(frame%120){
            if(clientsocket.getRemoteAddress()==sf::IpAddress::None){
                connected=0;
                connectionS.setTexture(offt);
            }
        }


        window.clear(bgcolor);{
        if(mode==ingame){
            window.draw(backgrounds);
            for(int i=0; i<wormpointers.size(); i++){
                (*wormpointers[i]).draw(window);
            }
        }else
        if(mode==connectroom){
            if(connected)
                for(list<gamelistelements>::iterator i=gamelist.begin(); i!=gamelist.end(); ++i){
                    (*i).draw(window, inputbars, binputbars);
                }
            window.draw(bgplanes);
            inputbars.setPosition(ipinput.getPosition()+sf::Vector2f(-8,-8));
            window.draw(inputbars);
            window.draw(ipinput);
            inputbars.setPosition(portinput.getPosition()+sf::Vector2f(-8,-8));
            window.draw(inputbars);
            window.draw(portinput);
            binputbars.setPosition(nickinput.getPosition()+sf::Vector2f(-8,-8));
            window.draw(binputbars);
            window.draw(nickinput);
            binputbars.setPosition(roomnameinput.getPosition()+sf::Vector2f(-8,-8));
            window.draw(binputbars);
            window.draw(roomnameinput);
            binputbars.setPosition(passwordinput.getPosition()+sf::Vector2f(-8,-8));
            window.draw(binputbars);
            window.draw(passwordinput);
            for(int i=0; i<5; i++)
                window.draw(info[i]);
            if(connected)
                for(int i=5; i<7; i++)
                    window.draw(info[i]);
            window.draw(okconnects);
            window.draw(oknicks);
            window.draw(okcreaterooms);
            window.draw(reloadgamelists);
            window.draw(connectionS);
            window.draw(soundicons);
            if(soundbarexchanged){
                window.draw(soundbars);
                window.draw(soundpointers);
            }
        }else
        if(mode==lobby){
            window.draw(connectionS);
            window.draw(lobbynamet);
            window.draw(lobbyouts);
            inputbars.setPosition(seedinput.getPosition()+sf::Vector2f(-8,-8));
            window.draw(inputbars);
            window.draw(seedinput);
            window.draw(info[7]);
            if(changingsettings){
                for(int i=8; i<INFO_AMOUNT; i++)
                    window.draw(info[i]);
                window.draw(cb2players);
                window.draw(cb3players);
                window.draw(cb4players);
                window.draw(oksettings);
            }
            window.draw(readys);
            window.draw(soundicons);
            if(soundbarexchanged){
                window.draw(soundbars);
                window.draw(soundpointers);
            }
        }
        }window.display();
    }
    return 0;
}
