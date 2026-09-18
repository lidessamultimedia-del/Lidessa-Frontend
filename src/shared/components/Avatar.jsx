// Círculo de avatar reutilizado donde se muestra al usuario logueado
// (sidebar, topbar, ajustes de cuenta): foto si el usuario ya subió una
// (`user.avatar`, un data URL), o sus iniciales sobre el degradado
// institucional si no.
export default function Avatar({ user, size = 32 }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  if (user?.avatar) {
    return (
      <img src={user.avatar} alt={user.name ?? 'Avatar'} className="shrink-0"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    )
  }

  return (
    <div className="flex items-center justify-center font-bold shrink-0"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'linear-gradient(135deg, #005187, #4d82bc)', color: 'white',
        fontSize: Math.max(11, Math.round(size * 0.4)),
      }}>
      {initial}
    </div>
  )
}
