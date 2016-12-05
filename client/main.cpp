
#include <iostream>
#include <math.h>
#include <cstdlib>
#include <SFML/Graphics.hpp>
#include <SFML/Network.hpp>

using namespace std;

sf::TcpSocket socket;
sf::Socket::Status status;

bool connect(string ip, string port){
    sf::IpAddress ipaddress0(ip);
    if(ipaddress0==sf::IpAddress::None){
        cout<<"invalid ip\n";
        return 0;
    }
    status=socket.connect(ipaddress0, atoi(port.c_str()));
    if(status!=sf::Socket::Done)
    {
        cout<<"not connected\n";
        return 0;
    }
    socket.setBlocking(0);
    return 1;
}

sf::RenderWindow window(sf::VideoMode(1200, 720), "worms");
sf::Event event;
sf::Color bgcolor(40,40,40);
sf::Texture backgroundt, inputbart, okt;
sf::Sprite  backgrounds, inputbars, oks;
sf::Image backgroundi;
sf::Font mainfont;
sf::Text ipinput, portinput, ipinfo, portinfo;
sf::Color checkedclr(0,255,255), normalclr(0,255,0);
float mapscale=1;
bool bounds[4];//up,right,down,left
enum modes{ingame, waitroom};
modes mode=waitroom;
enum textboxes{none=0, ip, port};
textboxes textbox=none;
string buffer;
unsigned char data[128];
size_t received=0;

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
        inputbart.loadFromFile("img/inputbar.bmp");
        inputbars.setTexture(inputbart);
        okt.loadFromFile("img/ok.bmp");
        oks.setTexture(okt);
        oks.setPosition(0,60);
        mainfont.loadFromFile("font.ttf");
        ipinput.setFont(mainfont);
        ipinput.setString("192.168.100.101");
        ipinput.setCharacterSize(12);
        ipinput.setPosition(8,8);
        ipinput.setColor(normalclr);
        portinput.setFont(mainfont);
        portinput.setString("80");
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
    }
    while(window.isOpen()){
        while(window.pollEvent(event)){
            if(event.type==sf::Event::Closed){
                socket.disconnect();
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
            if(mode==waitroom){
                if(event.type==sf::Event::MouseButtonPressed){
                    if(textbox==ip){
                        ipinput.setColor(normalclr);
                    }else
                    if(textbox==port){
                        portinput.setColor(normalclr);
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
                    if((event.mouseButton.x>=oks.getPosition().x)&&(event.mouseButton.x<=oks.getPosition().x+oks.getLocalBounds().width)&&(event.mouseButton.y>=oks.getPosition().y)&&(event.mouseButton.y<=oks.getPosition().y+oks.getLocalBounds().height)){
                        if(connect(ipinput.getString(), portinput.getString())){
                            cout<<"connected\n";
                        }
                    }
                }else
                if(event.type==sf::Event::TextEntered){
                    if(textbox==ip){
                        if((event.text.unicode==13)||(event.text.unicode==127)){
                            textbox=port;
                            portinput.setColor(normalclr);
                            ipinput.setColor(checkedclr);
                        }else
                        if(event.text.unicode==8){
                            buffer=ipinput.getString();
                            if(buffer.length()){
                                buffer.erase(buffer.length()-1);
                                ipinput.setString(buffer);
                            }
                        }else
                        {
                            ipinput.setString(ipinput.getString()+event.text.unicode);
                        }
                    }else
                    if(textbox==port){
                        if(event.text.unicode==127){
                            textbox=ip;
                            portinput.setColor(checkedclr);
                            ipinput.setColor(normalclr);
                        }else
                        if(event.text.unicode==8){
                            buffer=portinput.getString();
                            if(buffer.length()){
                                buffer.erase(buffer.length()-1);
                                portinput.setString(buffer);
                            }
                        }else
                        {
                            portinput.setString(portinput.getString()+event.text.unicode);
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


        if(socket.receive(data, 128, received)==sf::Socket::Done){
            cout<<"odebrano.size()=="<<received<<"\n";
            for(int i=0; i<received; i++){
                if(!data[i]){
                    socket.disconnect();
                    cout<<"\ndisconnected\n";
                }else
                cout<<data[i];
            }cout<<"\n";
        }


        window.clear(bgcolor);
        if(mode==ingame){
            window.draw(backgrounds);
        }else
        if(mode==waitroom){
            window.draw(inputbars);
            inputbars.move(0,inputbars.getLocalBounds().height);
            window.draw(inputbars);
            inputbars.move(0,-inputbars.getLocalBounds().height);
            window.draw(ipinput);
            window.draw(portinput);
            window.draw(ipinfo);
            window.draw(portinfo);
            window.draw(oks);
        }
        window.display();
    }
    return 0;
}
