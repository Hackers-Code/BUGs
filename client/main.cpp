#include <iostream>
#include <math.h>
#include <cstdlib>
#include <windows.h>
#include <iomanip>
#include <list>
#include <SFML/Graphics.hpp>
#include <SFML/Network.hpp>

#define INFO_AMOUNT 12

using namespace std;

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
sf::Texture backgroundt, inputbart, binputbart, okt, bgplanet, reloadgamelistt;
sf::Sprite  backgrounds, inputbars, binputbars, okconnects, oknicks, okcreaterooms, bgplanes, reloadgamelists;
sf::Image backgroundi, bgplanei;
sf::Font mainfont;
sf::Text info[INFO_AMOUNT], ipinput, portinput, nickinput, roomnameinput, passwordinput;
float mapscale=1;
bool bounds[4];//up,right,down,left
enum modes{ingame, connectroom, lobby};
enum textboxes{none=0, ip, port, nick, roomname, password};
modes mode=lobby;
textboxes textbox=none;
string buffer, nickname, restofprotocol;
size_t received=0;
unsigned int myid=0, to_receive=0, to_ignore=0, lastgamelistelement=0, frame=0;
float deltagamelist=120;


//zmienne do lobby
string lobbyname;
sf::Text lobbynamet, seedinput;
sf::Texture lobbyoutt, checkboxon, checkboxoff;
sf::Sprite  lobbyouts, cb2players, cb3players, cb4players;
int playersamount=2;


class gamelistelements{public:
    unsigned int id, pos;
    string name;
    sf::Text namet, idt;

    gamelistelements(unsigned int posin=1, unsigned int idin=0, string namein=""){
        pos=posin;
        id=idin;
        name=namein;

        namet.setFont(mainfont);
        namet.setColor(normalclr);
        namet.setCharacterSize(12);
        namet.setString(name);
        idt.setFont(mainfont);
        idt.setColor(normalclr);
        idt.setCharacterSize(12);
        idt.setString(to_string(id));
    }

    gamelistelements operator =(gamelistelements &input){
        input.id=id;
        input.name=name;
        input.pos=pos;
        input.namet.setString(name);
        input.idt.setString(to_string(id));
    }

    void update(){
        namet.setString(name);
        idt.setString(to_string(id));
    }

    void draw(sf::RenderWindow &window, sf::Sprite &sprite, sf::Sprite &bsprite){
        sprite.setPosition(0, deltagamelist+pos*sprite.getLocalBounds().height);
        window.draw(sprite);
        bsprite.setPosition(sprite.getLocalBounds().width, deltagamelist+pos*sprite.getLocalBounds().height);
        window.draw(bsprite);
        namet.setPosition(sprite.getLocalBounds().width+8, deltagamelist+pos*sprite.getLocalBounds().height+8);
        window.draw(namet);
        idt.setPosition(8, deltagamelist+pos*sprite.getLocalBounds().height+8);
        window.draw(idt);
    }
};
list<gamelistelements> gamelist;

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
    window.setFramerateLimit(60);
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
            if(clientsocket.send(to_send, 25)==sf::Socket::Done) cout<<"poszlo\n"; else cout<<"sending error\n";
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
        if(clientsocket.send(to_send, 26+(buffer.length()))==sf::Socket::Done) cout<<"poszlo\n";
        else cout<<"sending error\n";
    }else cout<<"not connected, can not create room\n";
}

void protocol9(unsigned int idbuffer, unsigned int seed, unsigned char playersamount){

}
//}

int main(){
    {
        system("color 0a");
        window.setFramerateLimit(60);
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
                        }
                    }else
                    if(mapscale>0.2){
                        mapscale-=0.1;
                        backgrounds.setScale(mapscale, mapscale);
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
                    if(textbox==ip){
                        ipinput.setColor(normalclr);
                    }else
                    if(textbox==port){
                        portinput.setColor(normalclr);
                    }else
                    if(textbox==nick){
                        nickinput.setColor(normalclr);
                    }else
                    if(textbox==roomname){
                        roomnameinput.setColor(normalclr);
                    }else
                    if(textbox==password){
                        passwordinput.setColor(normalclr);
                    }
                    textbox=none;


                    if((event.mouseButton.x>=ipinput.getPosition().x-8)&&(event.mouseButton.x<=ipinput.getPosition().x-8+inputbars.getLocalBounds().width)&&(event.mouseButton.y>=ipinput.getPosition().y-8)&&(event.mouseButton.y<=ipinput.getPosition().y-8+inputbars.getLocalBounds().height)){
                        textbox=ip;
                        ipinput.setColor(checkedclr);
                    }else
                    if((event.mouseButton.x>=portinput.getPosition().x-8)&&(event.mouseButton.x<=portinput.getPosition().x-8+inputbars.getLocalBounds().width)&&(event.mouseButton.y>=portinput.getPosition().y-8)&&(event.mouseButton.y<=portinput.getPosition().y-8+inputbars.getLocalBounds().height)){
                        textbox=port;
                        portinput.setColor(checkedclr);
                    }else
                    if((event.mouseButton.x>=nickinput.getPosition().x-8)&&(event.mouseButton.x<=nickinput.getPosition().x-8+binputbars.getLocalBounds().width)&&(event.mouseButton.y>=nickinput.getPosition().y-8)&&(event.mouseButton.y<=nickinput.getPosition().y-8+binputbars.getLocalBounds().height)){
                        textbox=nick;
                        nickinput.setColor(checkedclr);
                    }else
                    if((event.mouseButton.x>=roomnameinput.getPosition().x-8)&&(event.mouseButton.x<=roomnameinput.getPosition().x-8+binputbars.getLocalBounds().width)&&(event.mouseButton.y>=roomnameinput.getPosition().y-8)&&(event.mouseButton.y<=roomnameinput.getPosition().y-8+binputbars.getLocalBounds().height)){
                        textbox=roomname;
                        roomnameinput.setColor(checkedclr);
                    }else
                    if((event.mouseButton.x>=passwordinput.getPosition().x-8)&&(event.mouseButton.x<=passwordinput.getPosition().x-8+binputbars.getLocalBounds().width)&&(event.mouseButton.y>=passwordinput.getPosition().y-8)&&(event.mouseButton.y<=passwordinput.getPosition().y-8+binputbars.getLocalBounds().height)){
                        textbox=password;
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
                    if((event.mouseButton.x>=reloadgamelists.getPosition().x)&&(event.mouseButton.x<=reloadgamelists.getPosition().x+reloadgamelists.getLocalBounds().width)&&(event.mouseButton.y>=reloadgamelists.getPosition().y)&&(event.mouseButton.y<=reloadgamelists.getPosition().y+reloadgamelists.getLocalBounds().height)){
                        if(connected){unsigned char gfhahdsgfgdj[1]={5};
                            if(clientsocket.send(gfhahdsgfgdj,1)!=sf::Socket::Done) cout<<"error while sending request 5\n";
                            else {
                                gamelist.clear();
                                lastgamelistelement=0;
                            }
                        }else cout<<"not connected, cannot refresh\n";
                    }
                }else
                if(event.type==sf::Event::TextEntered){sf::Text* inputpointer=0;
                    if(textbox==ip){inputpointer=&ipinput;
                        if((event.text.unicode==13)||(event.text.unicode==9)){
                            textbox=port;
                            portinput.setColor(checkedclr);
                            ipinput.setColor(normalclr);
                        }
                    }else
                    if(textbox==port){inputpointer=&portinput;
                        if(event.text.unicode==9){
                            textbox=ip;
                            portinput.setColor(normalclr);
                            ipinput.setColor(checkedclr);
                        }else
                        if(event.text.unicode==13){
                            if(connect(ipinput.getString(), portinput.getString())) cout<<"connected\n";
                        }
                    }else
                    if(textbox==nick){inputpointer=&nickinput;
                        if(event.text.unicode==13){
                            protocol3(nickinput.getString(), myid);
                            nickinput.setColor(normalclr);
                            inputpointer=0;
                        }
                    }else
                    if(textbox==roomname){inputpointer=&roomnameinput;
                        if((event.text.unicode==13)&&(event.text.unicode==9)){
                            textbox=password;
                            passwordinput.setColor(checkedclr);
                            roomnameinput.setColor(normalclr);
                        }
                    }else
                    if(textbox==password){inputpointer=&passwordinput;
                        if(event.text.unicode==13){
                            protocol7(passwordinput.getString(), myid, roomnameinput.getString());
                            inputpointer=0;
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
                }
            }else
            if(mode==lobby){
                if(event.type==sf::Event::MouseButtonPressed){
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
                    }
                }
            }
        }
        if(bounds[3]){
            if(backgrounds.getPosition().x<-9) backgrounds.move(10, 0); else{
                if(backgrounds.getPosition().x<0) backgrounds.setPosition(0, backgrounds.getPosition().y);
            }
        }else
        if(bounds[1]){
            if(backgrounds.getPosition().x+(backgrounds.getLocalBounds().width*backgrounds.getScale().x)>window.getSize().x+9) backgrounds.move(-10, 0); else
                if(backgrounds.getPosition().x+(backgrounds.getLocalBounds().width*backgrounds.getScale().x)>window.getSize().x) backgrounds.setPosition(window.getSize().x-(backgrounds.getLocalBounds().width*backgrounds.getScale().x), backgrounds.getPosition().y);
        }
        if(bounds[0]){
            if(backgrounds.getPosition().y<-9) backgrounds.move(0, 10); else{
                if(backgrounds.getPosition().y<0) backgrounds.setPosition(backgrounds.getPosition().x, 0);
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
                        }
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
                                cout<<"room accepted\n"<<char(7);
                            }else{
                                cout<<"room denited\n";
                            }
                        }
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
                cout<<"myid="<<myid<<"\n";
            }
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
                for(int i=deltareceive; i<received; i++){
                    if(to_receive==0){
                        cout<<"roomlist is empty\n";
                        receiving=0;
                        deltareceive=0;
                        break;
                    }
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
        }else
        if(mode==lobby){
            window.draw(connectionS);
            window.draw(lobbynamet);
            window.draw(lobbyouts);
            for(int i=7; i<INFO_AMOUNT; i++)
                window.draw(info[i]);
            inputbars.setPosition(seedinput.getPosition()+sf::Vector2f(-8,-8));
            window.draw(inputbars);
            window.draw(seedinput);
            window.draw(cb2players);
            window.draw(cb3players);
            window.draw(cb4players);
        }
        }window.display();
    }
    return 0;
}
