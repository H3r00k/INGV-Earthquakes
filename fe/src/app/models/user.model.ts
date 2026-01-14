
export interface RegisterRequest{
    name: string;
    lastname: string;
    email: string;
    password: string
}

export interface RegisterResponse{
    msg: string;
}

export interface LoginRequest{
    email: string;
    password: string;

}


export interface User{
    id: number;
    name: string;
    lastname: string;
    email: string;
    role: 'USER' | 'ADMIN';
}