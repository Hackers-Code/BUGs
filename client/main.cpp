#include <iostream>
#include <math.h>
#include <cstdlib>
#include <windows.h>
#include <SFML/Graphics.hpp>
#include <SFML/Network.hpp>

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
    return 1;
}

sf::RenderWindow window(sf::VideoMode(1200, 720), "worms");
sf::Event event;
sf::Color bgcolor(40,40,40);
sf::Texture backgroundt, inputbart, okt;
sf::Sprite  backgrounds, inputbars, oks;
sf::Image backgroundi;
sf::Font mainfont;
sf::Text ipinput, portinput, ipinfo, portinfo, nickinput, nickinfo;
sf::Color checkedclr(0,255,255), normalclr(0,255,0);
float mapscale=1;
bool bounds[4];//up,right,down,left
enum modes{ingame, connectroom};
enum textboxes{none=0, ip, port, nick};
modes mode=connectroom;
textboxes textbox=none;
string buffer, nickname;
size_t received=0;
unsigned int myid=0;

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

int main(){
    {
        system("color 0a");
        window.setFramerateLimit(60);
        inputbart.loadFromFile("img/inputbar.bmp");
        inputbars.setTexture(inputbart);
        okt.loadFromFile("img/ok.bmp");
        oks.setTexture(okt);
        oks.setPosition(0,60);
        ont.loadFromFile("img/on.bmp");
        offt.loadFromFile("img/off.bmp");
        connectionS.setTexture(offt);
        connectionS.setPosition(1170,0);
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
        ipinfo.setFont(mainfont);
        ipinfo.setString("ip");
        ipinfo.setCharacterSize(12);
        ipinfo.setPosition(150,8);
        ipinfo.setColor(normalclr);
        portinfo.setFont(mainfont);
        portinfo.setString("port");
        portinfo.setCharacterSize(12);
        portinfo.setPosition(150,38);
        portinfo.setColor(normalclr);
        nickinput.setFont(mainfont);
        nickinput.setString("guest");
        nickinput.setCharacterSize(12);
        nickinput.setPosition(258,8);
        nickinput.setColor(normalclr);
        nickinfo.setFont(mainfont);
        nickinfo.setString("nickname");
        nickinfo.setCharacterSize(12);
        nickinfo.setPosition(400, 8);
        nickinfo.setColor(normalclr);
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
                    }
                    textbox=none;


                    if((event.mouseButton.x>=inputbars.getPosition().x)&&(event.mouseButton.x<=inputbars.getPosition().x+inputbars.getLocalBounds().width)&&(event.mouseButton.y>=inputbars.getPosition().y)&&(event.mouseButton.y<=inputbars.getPosition().y+inputbars.getLocalBounds().height)){
                        textbox=ip;
                        ipinput.setColor(checkedclr);
                    }else
                    if((event.mouseButton.x>=inputbars.getPosition().x)&&(event.mouseButton.x<=inputbars.getPosition().x+inputbars.getLocalBounds().width)&&(event.mouseButton.y>=inputbars.getPosition().y+inputbars.getLocalBounds().height)&&(event.mouseButton.y<=inputbars.getPosition().y+inputbars.getLocalBounds().height*2)){
                        textbox=port;
                        portinput.setColor(checkedclr);
                    }else
                    if((event.mouseButton.x>=inputbars.getPosition().x+100+inputbars.getLocalBounds().width)&&(event.mouseButton.x<=inputbars.getPosition().x+100+inputbars.getLocalBounds().width*2)&&(event.mouseButton.y>=inputbars.getPosition().y)&&(event.mouseButton.y<=inputbars.getPosition().y+inputbars.getLocalBounds().height)){
                        textbox=nick;
                        nickinput.setColor(checkedclr);
                    }else
                    if((event.mouseButton.x>=oks.getPosition().x)&&(event.mouseButton.x<=oks.getPosition().x+oks.getLocalBounds().width)&&(event.mouseButton.y>=oks.getPosition().y)&&(event.mouseButton.y<=oks.getPosition().y+oks.getLocalBounds().height)){
                        if(connect(ipinput.getString(), portinput.getString())){
                            cout<<"connected\n";
                        }
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
                            buffer=nickinput.getString();
                            if(buffer.length()<=20){//parser do protoko³u 3
                                unsigned char to_send[25]={0};
                                unsigned int nickbuffer=myid;
                                to_send[0]=3;
                                for(int i=4; i>0; i--){
                                    to_send[i]=nickbuffer%256;
                                    nickbuffer=nickbuffer>>8;
                                }
                                for(int i=0; i<buffer.length(); i++){
                                    to_send[i+4]=buffer[i];
                                }
                                if (clientsocket.send(to_send, 25)==sf::Socket::Done) cout<<"poszlo\n"; else cout<<"sending error\n";
                            }
                            nickinput.setColor(normalclr);
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
                if(!data[i]){
                    clientsocket.disconnect();
                    cout<<"\ndisconnected\n";
                    connectionS.setTexture(offt);
                    break;
                }
                if(data[i]==2){
                    receiving=2;
                    deltareceive=i+1;
                    break;
                }
                if(data[i]==4){
                    if(i+1<received){
                        if(data[i+1]){
                            nickname=nickinput.getString();
                            cout<<"nick accepted\n"<<char(7);
                        }else{
                            cout<<"nick denited\n";
                        }
                    }
                }
            }
            if(receiving==2){
                for(int i=deltareceive; i<deltareceive+4; i++){
                    myid=myid<<8;
                    myid+=data[i];
                }
                receiving=0;
                cout<<"myid="<<myid<<"\n";
            }
        }


        window.clear(bgcolor);
        if(mode==ingame){
            window.draw(backgrounds);
        }else
        if(mode==connectroom){
            window.draw(inputbars);
            inputbars.move(0,inputbars.getLocalBounds().height);
            window.draw(inputbars);
            inputbars.move(inputbars.getLocalBounds().width+100,0);
            window.draw(inputbars);
            inputbars.move(0,-inputbars.getLocalBounds().height);
            window.draw(inputbars);
            inputbars.move(-(inputbars.getLocalBounds().width+100),0);
            window.draw(ipinput);
            window.draw(portinput);
            window.draw(ipinfo);
            window.draw(portinfo);
            window.draw(nickinput);
            window.draw(nickinfo);
            window.draw(oks);
            window.draw(connectionS);
        }
        window.display();
    }
    return 0;
}
