#ifndef PROTOCOLS_CPP
#define PROTOCOLS_CPP


void protocol1(string buffer){
    if(buffer.length()<=20){
        if(connected){
            unsigned char to_send[21]={0};
            to_send[0]=1;
            for(int i=0; i<buffer.length(); i++){
                to_send[i+1]=buffer[i];
            }
            if(clientsocket.send(to_send, 21)==sf::Socket::Done) cout<<"poszlo 0x1\n"; else cout<<"sending error\n";
        }else cout<<"not connected, cannot get nick\n";
    }else cout<<"nick must have no more than 20 letters\n";
}
bool protocol3(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x3;
        if(clientsocket.send(to_send, 1)==sf::Socket::Done){
            cout<<"room leaved\n";
            mode=connectroom;
            return 1;
        }else cout<<"sending error 0x3\n";
    }else cout<<"not connected, cannot leave room\n";
    return 0;
}
void protocol6(){
    unsigned char to_send[7];
    to_send[0]=6;
    protbufferi[0]=myid;
    for(int i=4; i>0; i--){
        to_send[i]=protbufferi[0]%256;
        protbufferi[0]=protbufferi[0]>>8;
    }
    to_send[5]=(udpsocket.getLocalPort()>>8)%256;
    to_send[6]=udpsocket.getLocalPort()%256;
    if(udpsocket.send(to_send, 5, serverip, 31337)!=sf::Socket::Done){
        cout<<"sending error 0x6\n";
    }
    protbufferi[0]=0;
}
void protocol10(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x10;
        if(clientsocket.send(to_send, 1)==sf::Socket::Done){
            cout<<"poszlo 0x10\n";
            gamelist.clear();
            lastgamelistelement=0;
            deltagamelist=120;
        }else cout<<"sending error 0x10\n";
    }else cout<<"not connected, cannot get room list\n";
}
void protocol20(string buffer, string buffer2){
    if(connected){
        unsigned char to_send[22+(buffer.length())];
        to_send[0]=0x20;
        for(int i=1; i<21; i++){
            if(i-1<buffer2.length()){
                to_send[i]=buffer2[i-1];
            }else
                to_send[i]=0;
        }
        to_send[21]=buffer.length();
        for(int i=22; i<to_send[21]+22; i++){
            to_send[i]=buffer[i-22];
        }
        if(clientsocket.send(to_send, 22+(buffer.length()))==sf::Socket::Done) cout<<"poszlo 0x20\n";
        else cout<<"sending error\n";
    }else cout<<"not connected, can not create room\n";
}
void protocol22(){
    if(connected){
        unsigned char to_send[9];
        to_send[0]=0x22;
        to_send[1]=(ay>>8)%256;
        to_send[2]=ay%256;
        to_send[3]=(vjump)>>8;
        to_send[4]=vjump;
        to_send[5]=(vymax>>8)%256;
        to_send[6]=(vymax)%256;
        to_send[7]=(vxmax>>8)%256;
        to_send[8]=(vxmax)%256;
        if(clientsocket.send(to_send, 9)==sf::Socket::Done){
            cout<<"poszlo 0x22\n";
        }else cout<<"sending error 0x22\n";
    }else cout<<"not connected, cannot set physic\n";
}
void protocol24(unsigned int seed, unsigned char playersamount){
    if(connected){
		unsigned char to_send[6];
		to_send[0]=0x24;
		for(int i=4; i>0; i--){
			to_send[i]=seed%256;
			seed=seed>>8;
		}
		to_send[5]=playersamount;
		if(clientsocket.send(to_send, 6)==sf::Socket::Done) cout<<"poszlo 0x24\n";
		else cout<<"sending error\n";
    }else cout<<"not connected, cannot change settings\n";
}
void protocol26(unsigned int gameid, string password){
    if(password.length()<256){
        if(connected){
            unsigned char length=password.length(), to_send[10+length];
            to_send[0]=0x26;
            protbufferi[0]=gameid;
            for(int i=4; i>0; i--){
                to_send[i]=gameid%256;
                gameid=gameid>>8;
            }
            protbuffers[0]=password;
            to_send[5]=length;
            for(int i=0; i<length; i++){
                to_send[i+6]=password[i];
            }
            if(clientsocket.send(to_send, 6+length)==sf::Socket::Done){
                cout<<"poszlo 0x26\n";
            }else cout<<"sending error 0x26\n";
        }else cout<<"not connected, cannot join\n";
    }else cout<<"password too long (255 chars max)\n";
}
bool protocol28(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x28;
        if(clientsocket.send(to_send, 1)==sf::Socket::Done){
            cout<<"poszlo 0x28\n";
            return 1;
        }else cout<<"sending error 0x28\n";
    }else cout<<"not connected, cannot get room settings\n";
    return 0;
}
void protocol2a(sf::Color input, unsigned char maskid){
    if(connected){
        unsigned char to_send[5];
        to_send[0]=0x2a;
        to_send[1]=input.r;
        to_send[2]=input.g;
        to_send[3]=input.b;
        to_send[4]=maskid;
        if(clientsocket.send(to_send, 5)==sf::Socket::Done){
            cout<<"poszlo 0x2a\n";
        }else cout<<"sending error 0x2a\n";
    }else cout<<"not connected, cannot set player settings\n";
}
void protocol2c(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x2c;
        if(clientsocket.send(to_send, 1)==sf::Socket::Done){
            cout<<"poszlo 0x2c\n";
        }else cout<<"sending error 0x2c\n";
    }else cout<<"not connected, cannot get ready\n";
}
void protocol2e(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x2e;
        if(clientsocket.send(to_send, 1)==sf::Socket::Done){
        }else cout<<"sending error 0x2e\n";
    }else cout<<"not connected, cannot get players list\n";
}
void protocol31(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x31;
        if(clientsocket.send(to_send, 1)==sf::Socket::Done){
        }else cout<<"sending error 0x31\n";
    }else cout<<"not connected, cannot get turn time\n";
}
bool protocol37(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x37;
        if(udpsocket.send(to_send, 1, serverip, 31337)!=sf::Socket::Done) cout<<"sending error 0x37\n";
        else return 1;
    }else cout<<"not connected, can not jump\n";
    return 0;
}
bool protocol38(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x38;
        if(udpsocket.send(to_send, 1, serverip, 31337)!=sf::Socket::Done) cout<<"sending error 0x38\n";
        else return 1;
    }else cout<<"not connected, can not move\n";
    return 0;
}
bool protocol39(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x39;
        if(udpsocket.send(to_send, 1, serverip, 31337)!=sf::Socket::Done) cout<<"sending error 0x39\n";
        else return 1;
    }else cout<<"not connected, can not move\n";
    return 0;
}
bool protocol3b(signed char input=0){
    if(connected){
        unsigned char to_send[2];
        to_send[0]=0x3b;
        to_send[1]=input;
        if(udpsocket.send(to_send, 2, serverip, 31337)!=sf::Socket::Done) cout<<"sending error 0x3b\n";
        else return 1;
    }else cout<<"not connected, can not aim\n";
    return 0;
}
bool protocol40(){
    if(connected){
        unsigned char to_send[1];
        to_send[0]=0x40;
        if(udpsocket.send(to_send, 1, serverip, 31337)!=sf::Socket::Done) cout<<"sending error 0x40\n";
        else return 1;
    }else cout<<"not connected, can not move\n";
    return 0;
}
bool protocol42(unsigned char weaponid=0){
    if(connected){
        unsigned char to_send[2];
        to_send[0]=0x42;
        to_send[1]=weaponid;
        if(udpsocket.send(to_send, 2, serverip, 31337)!=sf::Socket::Done) cout<<"sending error 0x42\n";
        else return 1;
    }else cout<<"not connected, can change weapon\n";
    return 0;
}
bool protocol43(unsigned int power=0){
    if(connected){
        unsigned char to_send[2];
        to_send[0]=0x43;
        to_send[1]=power%256;
        if(udpsocket.send(to_send, 2, serverip, 31337)!=sf::Socket::Done) cout<<"sending error 0x43\n";
        else return 1;
    }else cout<<"not connected, can not shoot\n";
    return 0;
}


#endif // PROTOCOLS_CPP
