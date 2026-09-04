interface CardProps {
    children: React.ReactNode;
}

export default function Card({ children }: CardProps) {
    return (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            {children}
        </div>
    );
}