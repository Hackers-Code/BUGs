#include <iostream>
#include <cstdlib>
#include <time.h>
#include <windows.h>
#include <fstream>

using namespace std;

int main(){
    system("color 0a");
    fstream plik;
    srand(time(0));
    plik.open("asd.txt", ios::out | ios::binary);
    unsigned char ch;
    if(plik.good()){
        for(int i=0; i<1000; i++){
            ch=rand()%36+48;
            if(ch>57)ch+=7;
            plik<<ch;
        }
    }else{
        cout<<"plik not good (nie wiem co sie dzieje, moze nie mam uprawnien)\n\n";
        system("pause");
    }
    return 0;
}
