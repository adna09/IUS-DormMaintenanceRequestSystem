using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Dorm.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNormalizedEmailAndSecureAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedEmail",
                table: "Users",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE [Users]
                SET [NormalizedEmail] = LOWER(LTRIM(RTRIM([Email])))
                WHERE [NormalizedEmail] IS NULL;
            ");

            migrationBuilder.Sql(@"
                IF EXISTS (
                    SELECT [NormalizedEmail]
                    FROM [Users]
                    GROUP BY [NormalizedEmail]
                    HAVING COUNT(*) > 1
                )
                BEGIN
                    THROW 50001, 'Duplicate normalized emails exist. Resolve duplicates before applying this migration.', 1;
                END
            ");

            migrationBuilder.AlterColumn<string>(
                name: "NormalizedEmail",
                table: "Users",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_NormalizedEmail",
                table: "Users",
                column: "NormalizedEmail",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_NormalizedEmail",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "NormalizedEmail",
                table: "Users");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);
        }
    }
}
