export function cn(...classes:(string|undefined|false|null)[]){return classes.filter(Boolean).join(' ')}

export function formatBRL(value: number, opts?: Intl.NumberFormatOptions){
	try{
		return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', maximumFractionDigits:0, ...opts }).format(value);
	}catch{
		return `R$ ${Math.round(value).toLocaleString('pt-BR')}`;
	}
}
